var http = require('http'),
    path = require('path');
var express = require('express')

var config = require('./config'),
    routes = require('./routes'),
    socks = require('./socks');

module.exports = function(callback) {
  var app = express();
  app.http = http.createServer(app);

  app.enable('trust proxy');

  app.configure('development', function() {
    app.use(express.logger('dev'));
  });

  app.configure('production', function() {
    app.use(express.logger('short'));
  });

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  routes(app);

  socks.operator.installHandlers(app.http, {prefix: '/sockjs/operator'});
  socks.agent.installHandlers(app.http, {prefix: '/sockjs/agent'});

  return process.nextTick(function() {
    return callback(null, app);
  });
};
