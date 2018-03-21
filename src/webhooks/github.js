const fetch = require('node-fetch');

const config = require('../config');

const destroy = require('../worker/destroy');
const storage = require('../storage');

module.exports = (req, res) => {
  try {
    const metadata = JSON.parse(req.body.payload);

    if (!metadata.pull_request || metadata.action != 'closed') return res.end();;

    const instance = storage.getProjectInstance(
      metadata.repository.name,
      `pr-${metadata.pull_request.number}`
    );

    if (instance) destroy({
      branchName: instance.name,
      repoName: metadata.repository.name
    })

    res.end();
  } catch (e) {
    return res.status(400).send(e.stack);
  }
};
