var sockjs = require('sockjs');

var operators = {};
var agents = {};

//
// Operator
//
var sockOperator = sockjs.createServer();
sockOperator.on('connection', function(conn) {
  console.log('new operator:', conn.id);
  operators[conn.id] = conn;

  conn.on('data', function(message) {

  });

  conn.on('close', function() {
    console.log('operator left:', conn.id);
    delete operators[conn.id];
  });
});
exports.operator = sockOperator;

//
// Agent
//
var sockAgent = sockjs.createServer();
sockAgent.on('connection', function(conn) {
  console.log('new agent:', conn.id);
  agents[conn.id] = conn;

  conn.on('data', function(message) {
    var msg = JSON.parse(message);
    for (var id in operators) {
      var payload = {
        id: conn.id,
        message: msg
      };
      payload = JSON.stringify(payload);
      operators[id].write(payload);
    }
  });

  conn.on('close', function() {
    console.log('agent left:', conn.id);
    delete agents[conn.id];
  });
});
exports.agent = sockAgent;
