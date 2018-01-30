const fs = require('fs');
const path = require('path');

const mkdir = (src) =>
  new Promise((resolve, reject) =>
    fs.mkdir(src, (err) => {
      if (err) reject(err);
      else resolve();
    })
  );

module.exports.mkdirp = async (root, ...dirnames) => {
  let src = path.join(root);
  for (const segment of dirnames) {
    src = path.join(src, segment);
    if (!fs.existsSync(src)) await mkdir(src);
  }
  return src;
};
