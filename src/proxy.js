const path = require('path');

const config = require('./config');
const log = require('./log');

const dockerproxy = require('@nodock/redbird').docker;
const proxy = require('@nodock/redbird')({
  port: config.proxy.port,
  bunyan: false,
  letsencrypt: {
    path: path.join(__dirname, 'certs'),
    port: 9999
  },
  ssl: {
    port: config.proxy.sslPort || 443,
    http2: true
  }
});

module.exports = proxy;

const images = new Set();

module.exports.watch = (domain, imageName) => {
  if (!images.has(imageName)) {
    log(`Registering new proxy domain : ${domain}`);
    dockerproxy(proxy).register(domain, imageName);
    images.add(imageName);
  }
};