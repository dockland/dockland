const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');

const execp = (command, options) =>
  new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout, stderr);
    });
  });

module.exports.pull = ({ image, cwd }) =>
  execp(`docker pull ${image}`, {
    cwd
  });

module.exports.updateDockerCompose = ({ ownerName, repoName, commitHash, dest }) =>
  new Promise((resolve, reject) =>
    https.get(
      `https://raw.githubusercontent.com/${ownerName}/${repoName}/${commitHash}/docker-compose.yml`,
      (res) => {
        if (res.statusCode !== 200) {
          reject(new Error('No docker-compose.yml found for this project'));
        } else {
          res.pipe(fs.createWriteStream(dest));
          res.on('end', () => resolve());
        }
      }
    )
  );

const optFlag = (flag, condition) => condition ? flag : '';

module.exports.dockerComposeLogs = ({ cwd, projectName, follow, timestamps, tail = 'all', services = [] }, callback) =>
  exec(`docker-compose -p ${projectName} logs ${optFlag('-f', follow)} ${optFlag('-t', timestamps)} --tail=${tail} ${services.join(' ')}`, { cwd }, callback);

module.exports.dockerComposeUp = ({ cwd, projectName }) =>
  execp(`docker-compose -p ${projectName} up -d`, {
    cwd
  });
