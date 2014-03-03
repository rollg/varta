var events = require('events');
var sockjs = require('sockjs');

var Operator = require('./operator'),
    Agent = require('./agent'),
    PositionManager = require('./position_manager.js');

var positionManager = new PositionManager();

//
// Operator
//
var sockOperator = sockjs.createServer();
sockOperator.on('connection', function(conn) {
  var operator = new Operator(conn);
  positionManager.addOperator(operator);

  conn.on('close', function() {
    positionManager.removeOperator(operator);
  });
});
exports.operator = sockOperator;

//
// Agent
//
var sockAgent = sockjs.createServer();
sockAgent.on('connection', function(conn) {
  var agent = new Agent(conn);
  positionManager.addAgent(agent);

  conn.on('close', function() {
    positionManager.removeAgent(agent);
  });
});
exports.agent = sockAgent;
