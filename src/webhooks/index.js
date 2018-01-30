const Router = require('express').Router;

const endpoint = Router();

endpoint.post('/travis', require('./travis'));

module.exports = endpoint;