const badwords = require("./db/badwords.json");
class BotOnMessage {
  constructor(bot) {
    this.bot = bot;
    this.temparr = [];
    this.initListeners();
  }
  initListeners() {
    this.bot.client.on("chat_message", async (ev) => {
      if (!ev) return;
      if (!ev.chat_message.message_content.segment && !ev.chat_message.message_content.segment >= 1) return;
      ev.me = await this.bot.client.getselfinfo();
      /*if (ev.sender_id.gaia_id == ev.me.self_entity.gaia_id) {
        console.log('asodfadsfoafskod')
      }*/
      var msg = {
        a: ev.chat_message.message_content.segment[0].text.trimStart(),
        p: {
          id: ev.sender_id.gaia_id,
          _id: ev.sender_id.chat_id,
          id: {
            chat_id: ev.sender_id.chat_id,
            gaia_id: ev.sender_id.gaia_id
          }
        }
      }
      msg.channel = Channel.channels.get(ev.conversation_id.id).data; //await this.bot.client.getconversation(ev.conversation_id.id);
      //console.log(msg)
      msg.p.name = await this.bot.getUsersById(msg.channel, [ev.sender_id.chat_id])[0].fallback_name;
      if (!msg.p.name) {
        msg.p.name = "Unknown"
      }
      msg.p.fallback_name = msg.p.name;


      /* if (msg.p.name.entities[0].properties.first_name) {
         msg.p.name = msg.p.name.entities[0].properties.first_name
       } else {
         msg.p.name = msg.p.name.entities[0].properties.display_name;
       }  */
      console.log("\x1b[31m", `(${ev.conversation_id.id}) (${msg.p._id}) ${msg.p.name}: ${msg.a}`, '\x1b[0m');


      msg.p.rank = this.bot.getRankById(msg.p._id);
      msg.data = this.bot.cmode.data;
      msg.args = msg.a.split(" ");
      msg.input = n => msg.args.slice(n).join(" ");
      msg.command = msg.args[0].split(this.bot.getCmdChar()).slice(1).join(this.bot.getCmdChar());

      function isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
      }
      for (let word of msg.a.toLowerCase().split(" ")) {
        if (badwords.includes(word)) {
          this.bot.sendChat(msg.channel.id, "Excuse me, that's a bad word, and it's not appropriate in my Christian Hangouts server.");
        }
      }
      if (((msg.command.startsWith('give_') || msg.command.startsWith('bestow_')) && !(msg.command == "give_" || msg.command == "bestow_")) && !isNaN(parseFloat(msg.command.split("_")[1]))) {
        if ((parseFloat(msg.command.split("_")[1]) >= 1 && parseFloat(msg.command.split("_")[1]) <= 100) && !isFloat(parseFloat(msg.command.split("_")[1])) && (parseFloat(msg.command.split("_")[1]).toString() === parseInt(msg.command.split("_")[1]).toString()) && (msg.command.split("_")[1] === Number(msg.command.split("_")[1]).toString())) {
          // console.log(msg.command)
          msg.givenum = parseInt(msg.command.split("_")[1]);
          msg.command = msg.command.split('_')[0];
          //console.log(msg.command, msg.givenum)
        }
      }
      this.bot.time = msg.t;
      /* if (msg.p._id === this.bot.client.getselfinfo()._id) {
         this.bot.messages = this.bot.messages.filter(item => item.replace(/[^\x00-\x7F\\]+| /gm, "") !== msg.a.replace(/[^\x00-\x7F\\]+| /gm, ""))
       }*/
      let commandobj = this.bot.commands.find((cmdobj) => cmdobj.cmd == msg.command || (typeof cmdobj.cmd == 'object' && cmdobj.cmd.includes(msg.command)));
      if (commandobj) {
        if ((msg.p.rank.id >= commandobj.minrank) || commandobj.cmd == "beans") {
          if (msg.args.length - 1 < commandobj.minargs) {
            this.bot.sendChat(msg.channel.id, this.bot.getUsage(commandobj.cmd))
          } else {
            if (!(commandobj.secondfunc != null && this.bot.cmode.mode != "cmd")) {
              if (commandobj.highscore) {
                if (!this.bot.highscores[commandobj.cmd]) {
                  this.bot.highscores[commandobj.cmd] = {
                    user: {
                      _id: "",
                      name: "Anonymous",
                      color: "#777"
                    },
                    highscore: "999",
                  }
                  this.bot.updatedb();
                }
              }
              if (msg.p._id == this.bot.client.getselfinfo()._id) return;
              if (!msg.a.startsWith(this.bot.getCmdChar())) return;
              commandobj.func(msg);
            } else {
              this.bot.sendChat(msg.channel.id, "Bot is busy!");
            }
          }
        } else {
          if (msg.p.rank.name == "Banned") {
            this.bot.sendChat(msg.channel.id, this.bot.banmsg);
          } else {
            switch (this.bot.getRankNameByRankid(commandobj.minrank)) {
              case "Owner": {
                this.bot.sendChat(msg.channel.id, `Sorry, you must be the owner to use this command.`);
                break;
              }
              default: {
                this.bot.sendChat(msg.channel.id, `Sorry, you must be a ${this.bot.getRankNameByRankid(commandobj.minrank)} or higher to use this command.`);
              }
            }
          }
        }
      } else {


        if (this.bot.cmode.mode != "cmd" && !msg.a.startsWith(this.bot.getCmdChar())) {
          if (this.bot.cmode.user._id == msg.p._id || this.bot.cmode.type == "all")
            this.bot.getCommandObj(this.bot.cmode.cmd).secondfunc(msg);
        }
      }
    })
  }
}

module.exports = (bot) => {
  return new BotOnMessage(bot)
}