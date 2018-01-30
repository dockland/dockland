const path = require('path');
const { mkdirp } = require('./_fsutils.js');
const { pull, updateDockerCompose, dockerComposeUp } = require('./_dockerutils');

const config = require('../config')
const proxy = require('../proxy');
const log = require('../log');

const deploy = async ({
  branchName,
  isPullRequest,
  ownerName,
  repoName,
  commitHash
}) => {
  if (isPullRequest || branchName !== 'master') return;

  log(`Received webhook for project ${repoName}`);

  const src = await mkdirp(config.docker.root, repoName, branchName.replace(/\//g, '-'));

  const imageName = `ebm1718travis/${repoName.toLowerCase()}:latest`;
  const domain = `${repoName.toLowerCase()}.${config.proxy.domain}`;

  await pull({ image: imageName, cwd: src });
  await updateDockerCompose({
    ownerName,
    repoName,
    commitHash,
    dest: path.join(src, 'docker-compose.yml')
  });

  await dockerComposeUp({ cwd: src });

  proxy.watch(domain, imageName);
};

module.exports = deploy;