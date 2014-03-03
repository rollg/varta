var util = require("util"),
    events = require("events");
var uuid = require("node-uuid");

function Agent(conn) {
  events.EventEmitter.call(this);

  this.id = uuid.v4();
  this.conn = conn;
  this.conn.on("data", this._onData.bind(this));

  this.channels = {};
  this.lastKnownPosition = null;

  this.on('position', this.onPosition.bind(this));
}
util.inherits(Agent, events.EventEmitter);
module.exports = Agent;

Agent.prototype._onData = function(data) {
  var msg = JSON.parse(data);
  if (!msg.cmd) {
    this.error("no cmd");
  }

  this.emit(msg.cmd, msg);
};

Agent.prototype.onPosition = function(msg) {
  this.lastKnownPosition = msg.position;
};

Agent.prototype.error = function(message) {
  console.error("error:", message);
  this._write({error: message});
};

Agent.prototype._write = function(payload) {
  var json = JSON.stringify(payload);
  this.conn.write(json);
};
