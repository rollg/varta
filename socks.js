var sockjs = require('sockjs');

var operators = {};
var agents = {};

// the list of agents subscribed to each channel
var channels = {};

//
// Operator
//
var sockOperator = sockjs.createServer();
sockOperator.on('connection', function(conn) {
  console.log('new operator:', conn.id);
  operators[conn.id] = conn;

  conn.on('data', function(message) {
    var msg = JSON.parse(message);
    msg.id = conn.id;
    console.log('operator message:', msg);

    switch (msg.cmd) {
      case 'subscribe':
        subscribeChannel(msg.id, msg.channel);
        break;

      case 'unsubscribe':
        unsubscribeChannel(msg.id, msg.channel);
        break;

      default:
        console.error('unknown command:', msg);
    }
  });

  conn.on('close', function() {
    console.log('operator left:', conn.id);
    unsubscribeAllChannels(conn.id);
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
    msg.id = conn.id;
    console.log('agent message:', msg);

    switch (msg.cmd) {
      case 'position':
        broadcastPosition(msg);
        break;

      case 'join':
        joinChannel(msg.id, msg.channel);
        break;

      case 'leave':
        leaveChannel(msg.id, msg.channel);
        break;

      default:
        console.error('unknown command:', msg);
    }
  });

  conn.on('close', function() {
    console.log('agent left:', conn.id);
    leaveAllChannels(conn.id);
    delete agents[conn.id];
  });
});
exports.agent = sockAgent;

function broadcastPosition(msg) {
  var agent = agents[msg.id];
  agent.lastPosition = msg.position;

  if (!agent.channels) {
    console.error('WARNING: agent has no channels:', agent);
    return;
  }

  agent.channels.forEach(function(channelId) {
    if (!channels[channelId]) {
      console.log('INFO: channel has no subscribers');
      return;
    }

    channels[channelId].forEach(function(operatorId) {
      var operator = operators[operatorId];
      if (!operator) {
        console.error('WARNING: operator not found:', operatorId);
        return;
      }

      operator.write(JSON.stringify(msg));
    });
  });
}

function joinChannel(agentId, channelId) {
  console.log('%s joining channel %s', agentId, channelId);
  var agent = agents[agentId];

  if (!agent.channels) {
    agent.channels = [];
  }

  var index = agent.channels.indexOf(channelId);
  if (index !== -1) {
    // already in channel
    return;
  }

  agent.channels.push(channelId);
}

function leaveChannel(agentId, channelId) {
  console.log('%s leaving channel %s', agentId, channelId);

  var agent = agents[agentId];

  if (!agent.channels) {
    return;
  }

  var index = agent.channels.indexOf(agentId);
  if (index === -1) {
    return;
  }

  agent.channels[channelId].splice(index, 1);
}

function subscribeChannel(operatorId, channelId) {
  console.log('%s subscribing to channel %s', operatorId, channelId);

  if (!channels[channelId]) {
    channels[channelId] = [];
  }

  if (channels[channelId].indexOf(operatorId) !== -1) {
    // already in channel
    return;
  }

  channels[channelId].push(operatorId);
}

function unsubscribeChannel(operatorId, channelId) {
  console.log('%s unsubscribing from channel %s', operatorId, channelId);

  if (!channels[channelId]) {
    // no such channel - nothing to leave
    return;
  }

  var index = channels[channelId].indexOf(operatorId);
  if (index === -1) {
    return;
  }

  channels[channelId].splice(index, 1);
}

function unsubscribeAllChannels(operatorId) {
  console.log('%s unsubscribing from all channels', operatorId);

  for (var channelId in channels) {
    unsubscribeChannel(operatorId, channelId);
  }
}
