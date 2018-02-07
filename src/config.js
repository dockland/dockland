module.exports = {
  // express server exposing webhooks and status API
  manager: {
    // domain name for manager
    domain: process.env.MANAGER_SUBDOMAIN || process.env.PROXY_DOMAIN,
    // port on which manager is listening, proxy will pass requests to this port
    port: process.env.MANAGER_PORT || 5000,
    // use truthy value to bypass payload validation when receiving webhooks
    // see (https://docs.travis-ci.com/user/notifications/#Verifying-Webhook-requests)
    blindlyTrustWebhooks: process.env.BLINDLY_TRUST_WEBHOOKS
  },
  proxy: {
    // base domain name for proxy, deployed apps will be listening on [repoName].[domain]
    domain: process.env.PROXY_DOMAIN,
    // port for https connections
    sslPort: process.env.HTTPS_PROXY_PORT,
    // port for http connection
    port: process.env.PROXY_PORT,
    // enable production mode for Let's Encrypt
    letsEncryptProduction: process.env.LETS_ENCRYPT_PRODUCTION
  },
  docker: {
    // root folder to store docker-compose.yml files
    root: process.env.DOCKER_ROOT || 'projects'
  }
}
