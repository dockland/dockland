const path = require('path');
const { mkdirp } = require('./_fsutils.js');
const { pull, updateDockerCompose, dockerComposeUp } = require('./_dockerutils');

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
const deploy = async ({
  branchName,
  isPullRequest,
  ownerName,
  repoName,
  commitHash
}) => {
  try {
    if (!isPullRequest && branchName !== 'master') return;

    log(`Received webhook for project ${repoName}`);

    const src = await mkdirp(config.docker.root, repoName, branchName.replace(/\//g, '-'));

    const tag = isPullRequest ? branchName : 'latest';
    const imageName = `ebm1718travis/${repoName.toLowerCase()}:${tag}`;
    const domain = `${isPullRequest ? branchName + '.' : ''}${repoName.toLowerCase()}.${config.proxy.domain}`;

    await pull({ image: imageName, cwd: src });
    await updateDockerCompose({
      ownerName,
      repoName,
      commitHash,
      dest: path.join(src, 'docker-compose.yml')
    });

    await dockerComposeUp({ cwd: src, projectName: `${repoName}-${branchName}`, tag });

    storage.upsertProject({
      name: repoName
    });
    storage.addInstance(repoName, { 
      name: branchName,
      image: imageName,
      domain,
      src,
      tag
    });

    proxy.watch(domain, imageName);
  } catch(e) {
    log(e.stack);
    throw(e);
  }
};

module.exports = deploy;
