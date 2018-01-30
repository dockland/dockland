module.exports = (next) => (req, res) => {
  try {
    let body = new Buffer(0);

    if (req.method === 'POST') {
      req.on('data', (data) => {
        body = Buffer.concat([ body, data ]);
      });

      req.on('end', () => {
        next(
          Object.assign({}, req, {
            body: JSON.parse(decodeURIComponent(body.toString().substring(8)))
          }),
          res
        );
      });
    } else {
      next(req, res);
    }
  } catch (e) {
    res.writeHead(500);
    res.end(e.stack);
  }
};
