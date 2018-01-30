const fetch = require('node-fetch');
const crypto = require('crypto');

const config = require('../config');

const deploy = require('../worker/deploy');

module.exports = (req, res) => {
  const options = {};
  try {
    const metadata = JSON.parse(req.body.payload);
    options.branchName = metadata.branch;
    options.isPullRequest = metadata.pull_request;

    options.ownerName = metadata.repository.owner_name;
    options.repoName = metadata.repository.name;
    options.commitHash = metadata.commit;
  } catch (e) {
    return res.status(400).send(e.stack);
  }

  if (config.manager.blindlyTrustWebhooks) {
    deploy(options).then(() => res.end()).catch(e => res.status(500).send(e.stack));
  } else {
    if (!req.headers.signature) return res.status(400).send('Missing payload signature');

    const signature = Buffer.from(req.headers.signature, 'base64');

    fetch('https://api.travis-ci.org/config').then(response => response.json()).then((data) => {
      const travisKey = data.config.notifications.webhook.public_key;
      const verifier = crypto.createVerify('sha1');
      verifier.update(req.body.payload);
      
      if (verifier.verify(travisKey, signature)) {
        deploy(options).then(() => res.end()).catch(e => res.status(500).send(e.stack));
      } else {
        return res.status(400).send('Bad payload signature');
      }
    })
  }
};