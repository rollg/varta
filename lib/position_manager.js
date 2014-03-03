var Channel = require('./channel');

function PositionManager() {
  this.operators = [];
  this.agents = [];

  this.channels = {};
}
module.exports = PositionManager;

PositionManager.prototype.addOperator = function(operator) {
  if (this.operators.indexOf(operator) !== -1) {
    return;
  }

  var self = this;
  this.operators.push(operator);
  operator.on('subscribe', function(cmd) {
    self.operatorSubscribeChannel(operator, cmd.channel);
  });

  operator.on('unsubscribe', function(cmd) {
    self.operatorUnsubscribeChanel(operator, cmd.channel);
  });
};

PositionManager.prototype.removeOperator = function(operator) {
  console.log('removing operator %s', operator.id);

  var index = this.operators.indexOf(operator);
  if (index === -1) {
    return;
  }

  var operator = this.operators[index];
  operator.removeAllListeners();
  this.operatorUnsubscribeAllChannels(operator);

  this.operators.splice(index, 1);
};

PositionManager.prototype.addAgent = function(agent) {
  if (this.agents.indexOf(agent) !== -1) {
    return;
  }

  var self = this;
  this.agents.push(agent);
  agent.on('position', function() {
    self.broadcastAgentPosition(agent);
  });

  agent.on('join', function(cmd) {
    self.agentJoinChannel(agent, cmd.channel);
  })

  agent.on('leave', function(cmd) {
    self.agentLeaveChannel(agent, cmd.channel);
  })
};

PositionManager.prototype.removeAgent = function(agent) {
  console.log('removing agent %s', agent.id);

  var index = this.agents.indexOf(agent);
  if (index === -1) {
    return;
  }

  var agent = this.agents[index];
  agent.removeAllListeners();
  this.agentLeaveAllChannels(agent);

  this.agents.splice(index, 1);
};

PositionManager.prototype.operatorSubscribeChannel = function(operator, channel) {
  console.log('operator %s subscribes %s', operator.id, channel);
  this.getChannel(channel).subscribe(operator);
};

PositionManager.prototype.operatorUnsubscribeChannel = function(operator, channel) {
  console.log('operator %s unsubscribes %s', operator.id, channel);
  if (!operator.channels[channel]) {
    return;
  }
  operator.channels[channel].unsubscribe(operator);
};

PositionManager.prototype.operatorUnsubscribeAllChannels = function(operator) {
  console.log('operator %s unsubscribes all channels', operator.id);
  for (var k in operator.channels) {
    operator.channels[k].unsubscribe(operator);
  }
};

PositionManager.prototype.agentJoinChannel = function(agent, channel) {
  console.log('agent %s joins %s', agent.id, channel);
  this.getChannel(channel).join(agent);
};

PositionManager.prototype.agentLeaveChannel = function(agent, channel) {
  console.log('agent %s leaves %s', agent.id, channel);
  if (!agent.channels[channel]) {
    return;
  }
  agent.channels[channel].leave(agent);
};

PositionManager.prototype.agentLeaveAllChannels = function(agent) {
  console.log('agent %s leaves all channels', agent.id);
  for (var k in agent.channels) {
    agent.channels[k].leave(agent);
  }
};

PositionManager.prototype.broadcastAgentPosition = function(agent) {
  console.log('agent %s broadcasts position', agent.id);
  for (var k in agent.channels) {
    agent.channels[k].broadcast(agent);
  }
};

PositionManager.prototype.getChannel = function(channel) {
  if (!this.channels[channel]) {
    this.channels[channel] = new Channel(channel);
  }
  return this.channels[channel];
};