var Bot = require("./src/bot.js");
global.fs = require('fs');
global.Channel = require("./src/Channel.js");
global.Bot = Bot;
global.BOT = new Bot();
global.request = require("request")
Channel.init(BOT);


Array.prototype.random = function () {
	return this[Math.floor(Math.random()*this.length)];
}
global.replaceAt = function(string, index, replace) {
    return string.substring(0, index) + replace + string.substring(index + 1);
  }
  