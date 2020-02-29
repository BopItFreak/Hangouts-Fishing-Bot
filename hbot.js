var Client = require('hangupsjs');
var Q = require('q');
 
// callback to get promise for creds using stdin. this in turn
// means the user must fire up their browser and get the
// requested token.
var creds = async function() {
  return {
    auth: async function() {
        return "4/tAHhFw47J5rUhCyy-KaV2i3Kf9tGXD9i-2Z4A-LfYJTnSjDLhte4uixjSVXpfvnV7VRHoyVBESH6r90Z7l8XEcs"
    }
  };
};
 
var client = new Client();
 
// set more verbose logging
//client.loglevel('debug');
 
// receive chat message events
client.on('chat_message', function(ev) {
  return console.log(ev.chat_message.message_content.segment);
});
 
// connect and post a message.
// the id is a conversation id.
var reconnect = function() {
  client.connect(creds).then(function() {
      // we are now connected. a `connected`
      // event was emitted.
  });
};

// whenever it fails, we try again
client.on('connect_failed', function() {
  Q.Promise(function(rs) {
      // backoff for 3 seconds
      setTimeout(rs,3000);
  }).then(reconnect);
});

// start connection
reconnect();