const { Router } = require('express');

const app = new Router();

app.use('/projects', require('./projects'));

module.exports = app;
