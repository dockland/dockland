const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const bodyParser = require('./body-parser');

const DOCKER_ROOT = './projects';

const execp = (command, options) =>
  new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout, stderr);
    });
  });

const pull = ({ image, cwd }) =>
  execp(`docker pull ${image}`, {
    cwd
  });

const updateDockerCompose = ({ ownerName, name, commit, dest }) =>
  new Promise((resolve, reject) =>
    https.get(
      `https://raw.githubusercontent.com/${ownerName}/${name}/${commit}/docker-compose.yml`,
      (res) => {
        res.pipe(fs.createWriteStream(dest));
        res.on('end', () => resolve());
      }
    )
  );

const dockerComposeUp = ({ cwd }) =>
  execp(`docker-compose up -d`, {
    cwd
  });

const deploy = (metadata) => {
  const branchName = metadata.branch;
  const pullRequest = metadata.pull_request;

  const ownerName = metadata.repository.owner_name;
  const name = metadata.repository.name;
  const commit = metadata.commit;

  if (!pullRequest && branchName === 'feature/cd') {
    let src = path.join(DOCKER_ROOT, name);
    if (!fs.existsSync(src)) fs.mkdirSync(src);

    src = path.join(src, branchName.replace(/\//g, '-'));
    if (!fs.existsSync(src)) fs.mkdirSync(src);

    pull({ image: `ebm1718travis/${name.toLowerCase()}`, cwd: src })
      .then(() =>
        updateDockerCompose({
          ownerName,
          name,
          commit,
          dest: path.join(src, 'docker-compose.yml')
        })
      )
      .then(() => dockerComposeUp({ cwd: src }))
      .then(() => console.log('yolo swag !'));
  }
};

const server = http.createServer(
  bodyParser((req, res) => {
    deploy(req.body);
  })
);

server.listen(process.env.PORT || 80);
