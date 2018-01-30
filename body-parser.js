module.exports = (next) => (req, res) => {
  let body = new Buffer(0);

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
};
