const { Router } = require('express');
const ansiHTML = require('ansi-html');
const readline = require('readline');
const storage = require('../storage');
const { dockerComposeLogs } = require('../worker/_dockerutils');

ansiHTML.setColors({
  reset: ['fff', '000']
});

const app = new Router();

app.get('/', (req, res) => res.send(storage.findProjects()));
app.get('/:projectName', (req, res) => res.send(storage.getProject(req.params.projectName)));

app.get('/:projectName/:instanceName/logs', (req, res) => {
  const services = Array.isArray(req.query.services) ? req.query.services : (req.query.services || '').split(',');
  const instance = storage.getProjectInstance(req.params.projectName, req.params.instanceName);
  const opts = {
    cwd: instance.src,
    projectName: `${req.params.projectName}-${instance.name}`,
    services,
    tail: req.query.tail,
    timestamps: req.query.timestamps !== undefined,
    follow: req.query.follow !== undefined
  };

  if (req.query.mode === 'pretty') {
    const logProcess = dockerComposeLogs(opts, err => res.end('</body></html>'));

    res.header('Content-type', 'text/html; charset=utf-8');
    res.write(`
      <html>
        <style>
          body {
            color: white;
            background: black;
            font-family: monospace;
          }
        </style>
        <body>
    `);

    readline.createInterface({
      input: logProcess.stdout
    }).on('line', data => res.write(ansiHTML(data.toString()) + '<br/>'));
  } else {
    const logProcess = dockerComposeLogs(opts, err => res.end());
    logProcess.stdout.pipe(res, { end: false });
  }
});

module.exports = app;
