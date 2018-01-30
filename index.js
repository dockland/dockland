const http = require('http');
const path = require('path');
const bodyParser = require('./body-parser');

const { mkdirp } = require('./fs');
const { pull, updateDockerCompose, dockerComposeUp } = require('./docker');

const dockerproxy = require('redbird').docker;
const redbird = require('redbird')({
  port: process.env.PROXY_PORT || 80,
  bunyan: false,
  letsencrypt: {
    path: path.join(__dirname, 'certs'),
    port: 9999
  },
  ssl: {
    port: process.env.HTTPS_PROXY_PORT || 443,
    http2: true
  }
});

const images = new Set();

const log = (...args) => console.log('>>> ', ...args);

const DOCKER_ROOT = './projects';

class BadRequestError extends Error {
  constructor(message) {
    super(message);
  }
}

const deploy = async (metadata) => {
  let branchName, pullRequest, ownerName, name, commit, imageName, domain;
  try {
    branchName = metadata.branch;
    pullRequest = metadata.pull_request;

    ownerName = metadata.repository.owner_name;
    name = metadata.repository.name;
    commit = metadata.commit;

    imageName = `ebm1718travis/${name.toLowerCase()}:latest`;
    domain = `${name.toLowerCase()}.${process.env.PROXY_DOMAIN}`;
  } catch (e) {
    throw new BadRequestError('Unexpected payload format');
  }

  if (pullRequest || branchName !== 'feature/cd') return;

  log(`Received webhook for project ${name}`);

  const src = await mkdirp(DOCKER_ROOT, name, branchName.replace(/\//g, '-'));

  await pull({ image: imageName, cwd: src });
  await updateDockerCompose({
    ownerName,
    name,
    commit,
    dest: path.join(src, 'docker-compose.yml')
  });

  if (!images.has(imageName)) {
    log(`Registering new proxy domain : ${domain}\n`);
    dockerproxy(redbird).register(domain, imageName);
    images.add(imageName);
  }

  await dockerComposeUp({ cwd: src });
};

const server = http.createServer(
  bodyParser((req, res) => {
    deploy(req.body)
      .then(() => {
        res.writeHead(200);
        res.end();
      })
      .catch((e) => {
        if (e instanceof BadRequestError) {
          res.writeHead(400);
          res.end(e.stack);
        } else {
          res.writeHead(500);
          res.end(e.stack);
        }
      });
  })
);

const HOOK_PORT = process.env.HOOK_PORT || 5000;

server.listen(HOOK_PORT, () => {
  redbird.register(process.env.PROXY_DOMAIN, `localhost:${HOOK_PORT}`);
  console.log(`Listening on port ${HOOK_PORT}`);
});
