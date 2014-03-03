module.exports = function(app) {
  app.get('/ping', function(req, res) {
    return res.send({pong: true});
  });
};
