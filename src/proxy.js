const path = require('path');

const config = require('./config');
const log = require('./log');

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

const dockerproxy = require('@nodock/redbird').docker;

module.exports = proxy;

const images = new Set();

/**
 * Register an existing Docker image to be watched by Redbird proxy.
 * Any container instanciated from this image will be used as a target for
 * incoming requests to this domain name.
 * @param {string} domain
 * @param {string} imageName
 */
module.exports.watch = (domain, imageName) => {
  if (!images.has(imageName)) {
    log(`Registering new proxy domain : ${domain}`);
    dockerproxy(proxy).register(domain, imageName, {
      ssl: {
        letsencrypt: {
          email: 'ebm1718travis@gmail.com',
          production: config.proxy.letsEncryptProduction,
        }
      }
    });
    images.add(imageName);
  }
};

/**
 * Unregister docker image
 * @param {string} domain
 * @param {string} imageName
 */
module.exports.unwatch = (domain, imageName) => {
  log(`Unregistering new proxy domain : ${domain}`);
  images.delete(imageName);
  dockerproxy(proxy).unregister(domain);
};
