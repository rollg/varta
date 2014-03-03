function Channel(name) {
  this.name = name;
  this.operators = [];
  this.agents = [];
}
module.exports = Channel;

Channel.prototype.subscribe = function(operator) {
  if (this.operators.indexOf(operator) !== -1) {
    return;
  }

  this.operators.push(operator);
  operator.channels[this.name] = this;
  this.broadcastTo(operator);
};

Channel.prototype.unsubscribe = function(operator) {
  var index = this.operators.indexOf(operator);
  if (index === -1) {
    return;
  }

  this.operators.splice(index, 1);
};

Channel.prototype.join = function(agent) {
  if (this.agents.indexOf(agent) !== -1) {
    return;
  }

  this.agents.push(agent);
  agent.channels[this.name] = this;
  this.broadcast(agent);
};

Channel.prototype.leave = function(agent) {
  var index = this.agents.indexOf(agent);
  if (index === -1) {
    return;
  }

  this.agents.splice(index, 1);
  this.broadcastLeave(agent);
};

Channel.prototype.broadcast = function(agent) {
  var info = getAgentInfo(agent);
  if (!info.position) {
    return;
  }

  var infos = [info];
  this.operators.forEach(function(operator) {
    operator.sendAgentsInfo(infos);
  });
};

Channel.prototype.broadcastLeave = function(agent) {
  var ids = [agent.id];
  this.operators.forEach(function(operator) {
    operator.sendAgentsLeave(ids);
  });
};

Channel.prototype.broadcastTo = function(operator) {
  var infos = this.agents.map(getAgentInfo);
  infos = infos.filter(function(info) {
    return info.position;
  });

  if (infos.length === 0) {
    return;
  }

  operator.sendAgentsInfo(infos);
};

function getAgentInfo(agent) {
  return {
    id: agent.id,
    position: agent.lastKnownPosition
  };
}
