module.exports = {
  manager: {
    domain: process.env.MANAGER_SUBDOMAIN || process.env.PROXY_DOMAIN,
    path: process.env.MANAGER_PATH || '',
    port: process.env.MANAGER_PORT || 5000,
    trustWebhooks: process.env.TRUST_WEBHOOKS
  },
  proxy: {
    domain: process.env.PROXY_DOMAIN,
    sslPort: process.env.HTTPS_PROXY_PORT,
    port: process.env.PROXY_PORT
  },
  docker: {
    root: process.env.DOCKER_ROOT || 'projects'
  }
}