const path = require('path');
const { dockerComposeDown } = require('./_dockerutils');

const config = require('../config');
const storage = require('../storage');
const proxy = require('../proxy');
const log = require('../log');

/**
 * Deploy a new instance with the following steps :
 * 1. Pull image from docker hub
 * 2. Fetch updated docker-compose.yml from Github repo
 * 3. Update Docker-Compose stack
 * @param {object} metadata 
 */
const destroy = async ({
  branchName,
  repoName
}) => {
  try {
    log(`Received webhook to destroy instance ${repoName}/${branchName}`);

    const imageName = `ebm1718travis/${repoName.toLowerCase()}:${branchName}`;
    const domain = `${repoName.toLowerCase()}.${config.proxy.domain}`;

    const src = path.join(config.docker.root, repoName, branchName.replace(/\//g, '-'));

    await dockerComposeDown({ cwd: src, projectName: `${repoName}-${branchName}` });

    storage.deleteInstance(repoName, branchName);

    proxy.unwatch(domain, imageName);
  } catch (e) {
    log(e.stack);
    throw (e);
  }
};

module.exports = destroy;
