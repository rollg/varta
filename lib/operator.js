var util = require("util"),
    events = require("events");
var uuid = require("node-uuid");

function Operator(conn) {
  events.EventEmitter.call(this);

  this.id = uuid.v4();
  this.conn = conn;
  this.conn.on("data", this._onData.bind(this));

  this.channels = {};
}
util.inherits(Operator, events.EventEmitter);
module.exports = Operator;

Operator.prototype.sendAgentsInfo = function(agents) {
  console.log("sendAgentsInfo:", agents);

  var msg = {
    cmd: 'agents',
    agents: agents
  };
  this._write(msg);
};

Operator.prototype.sendAgentsLeave = function(ids) {
  console.log("sendAgentsLeave:", ids);

  var msg = {
    cmd: 'leave',
    ids: ids
  };
  this._write(msg);
};

Operator.prototype._onData = function(data) {
  var msg = JSON.parse(data);
  if (!msg.cmd) {
    this.error("no cmd");
  }

  this.emit(msg.cmd, msg);
};

Operator.prototype.error = function(message) {
  console.error("error:", message);
  this._write({error: message});
};

Operator.prototype._write = function(payload) {
  var json = JSON.stringify(payload);
  this.conn.write(json);
};
