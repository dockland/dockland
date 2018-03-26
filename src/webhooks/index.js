const Router = require('express').Router;

const endpoint = Router();

endpoint.post('/travis', require('./travis'));
endpoint.post('/github', require('./github'));

module.exports = endpoint;
