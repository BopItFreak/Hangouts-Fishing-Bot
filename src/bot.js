const Client = require('hangupsjs');
const Q = require('q');

module.exports = class Bot {

  constructor(room) {
    this.room = room || "test/fishing";
    this.desiredbotName = "Fishing";
    this.focused = false;
    this.beansInterval;
    this.chatName = "Jude is great!"
    this.channels = Channel.channels;
    this.creds = async function() {
      return {
        auth: async function() {
            return "" //put your token here
        }
      };
    };
    this.client = new Client(); //("ws://websocket-proxy--anon64.repl.co?target=ws://104.237.150.24:8512");
    //this.client.chid = null;//'UgzZotDyAeF5qFug_th4AaABAQ'; //UgzZotDyAeF5qFug_th4AaABAQ //UgyhMRYB_lQk-vew2KN4AaABAagBvJmGDg
    this.client.loglevel('info');
    this.client.start = () => {
      this.client.connect(this.creds).then(() => {
          console.log("Connected");
          this.doStuff();
          this.client.syncrecentconversations().then((data) => {
            data.conversation_state.forEach(async (c) => {
              Channel.addChannel(c);
            });           
          });
      });
    };
    // whenever it fails, we try again
    this.client.on('connect_failed', () => {
      Q.Promise((rs) => {
          // backoff for 3 seconds
          setTimeout(rs,3000);
      }).then(this.client.start);
    })
    /*this.client.on("client_conversation", (a) => {
      if (a.conversation_id.id !== this.client.chid) return;
      this.client.ppl = a.participant_data;
    })*/
    this.client.on("conversation_rename", msg => {
      /*if (msg.conversation_rename.new_name !== this.chatName) {
        this.client.renameconversation(this.client.chid, this.chatName)
      }     */
    })
    this.client.start();
    this.ranks = require("./db/ranks.json");
    this.fishingdb = require("./db/fishingdb.json")
    this.fishing = {};
    this.kekklepeeps = {};
    this.commands = [];
    //require("./addCommands.js").bind(this)();
    this.banmsg = "lol no."
    this.cmdChar = "/"
    this.cmode = {
      user: {
        _id: "",
        name: "",
        color: "#777"
      },
      mode: "cmd",
      type: "1person",
      cmd: null
    }
    this.BotOnMessage = require("./BotOnMessage.js")(this);
    this.time = 0;
    this.fishnames = require("./db/fish.json");
    this.highscores = require("./db/highscores.json");
    this.kekklefruit = 0;
    this.messages = [];
    this.Color = require("./Color.js");
    this.kekkleinterval();
    //this.Command = require("./command.js");
    require("./temp.js").bind(this)();
}

  sendChat(chid, msg, img_id) { //sendchat func
    //console.log(chid,msg)
    if (typeof msg === 'string') {
      this.client.sendchatmessage(chid, [ //UgzZotDyAeF5qFug_th4AaABAQ
        [0, msg]
       ], img_id)
      } else if (typeof msg == 'object'){
        this.client.sendchatmessage(chid, msg)
      } else {
      throw `sendChat function requires string. not ${typeof msg}`
    }
  }

  getRankById(_id) {
    if (this.ranks.owner._id == _id) {
      return {
        id: 3,
        name: "Owner"
      };
    } else if (this.ranks.banned.hasOwnProperty(_id)) { //banned after owner so owner no ban.
      return {
        id: -1,
        name: "Banned"
      }
    } else if (this.ranks.admins.hasOwnProperty(_id)) {
      return {
        id: 2,
        name: "Admin"
      };
    } else if (this.ranks.helpers.hasOwnProperty(_id)) {
      return {
        id: 1,
        name: "Helper"
      };
    } else {
      return {
        id: 0,
        name: "User"
      };
    }
  }

  getRankNameByRankid(id) {
    switch (id) {
      case 3:
        return "Owner";
        break;
      case -1:
        return "Banned"; //same thing here
        break;
      case 2:
        return "Admin";
        break;
      case 1:
        return "Helper";
        break;
      default:
        return "User";
        break;
    }
  }

  getRankIdByRankName(id) {
    switch (id) {
      case "Owner":
        return 3;
        break;
      case "Banned":
        return -1; //same thing here
        break;
      case "Admin":
        return 2;
        break;
      case "Helper":
        return 1;
        break;
      default:
        return 0;
        break;
    }
  }

  getUsage(cmd) {
    let foundcmd = this.commands.find((command) => cmd == command.cmd)
    if (foundcmd)
      return foundcmd.usage.replace("CMDCHAR", this.cmdChar);
    else
      return `There is no help for the command '${cmd}'`;
  }

  getCmdChar() {
    return this.cmdChar;
  }

  getCommandObj(cmd) {
    return this.commands.find((command) => cmd == command.cmd);
  }

  getUsersByNameOrId(channel,user) {
    let usr = channel.ppl.filter((a) => a.id.chat_id == user || a.fallback_name.toLowerCase().includes(user.toLowerCase()))//this.client.searchentities(prsn.name.toLowerCase().includes(user.toLowerCase()));
    usr.forEach((b, num) => {
      usr[num]._id = b.id.chat_id;
      //usr[num].id = b.id.gaia_id;
    })
    
    return usr;
  }
  getUsersByName(channel,user) {
    let usr = channel.ppl.filter((a) => a.fallback_name.toLowerCase().includes(user.toLowerCase()))
    usr.forEach((b, num) => {
      usr[num]._id = b.id.chat_id;
     // usr[num].id = b.id.gaia_id;
    })
    return usr;
    // return this.client.searchentities(prsn.name.toLowerCase().includes(user.toLowerCase()));
  }
  getUsersById(channel,user) {
    let usr = channel.ppl.filter((a) => a.id.chat_id == user)
    usr.forEach((b, num) => {
      usr[num]._id = b.id.chat_id;
      usr[num].id = b.id.gaia_id;
    })
    return usr;
  }
  async changeRank(_id, rank) {
    //db.push("./ranks.json", {rank: {_id: _id} })
    for (let rankname of Object.keys(this.ranks)) {
      //remove _id from all ranks.
      if (this.ranks[rankname].hasOwnProperty(_id)) {
        delete this.ranks[rankname][_id]
        this.updatedb()
       // console.log(this.ranks);
      }
    }
    if (rank == "users") {
      this.updatedb();
      return this.getRankById(_id).name;

    } else {
      //give new rank
      if (!this.ranks[rank].hasOwnProperty(_id)) {
        this.ranks[rank][_id] = _id
        this.updatedb();
      } else {
        console.log("Nope!");
      }
      return this.getRankById(_id).name;
    }
  }

  resetHighscore(cmd) {
    let commandobj = this.getCommandObj(cmd);
    if (commandobj.highscore) {
      this.highscores[commandobj.cmd] = {
        user: { _id: "", name: "Anonymous", color: "#777" },
        highscore: "999",
      };
      this.updatedb();
    } else {
      console.error("This cmd doesn't use highscores.");
    }
  }

  resetAllHighscores() {
    this.highscores = {};
    this.updatedb();
  }

  async updateHighscores(user, cmd, highscore) {
    let commandobj = this.getCommandObj(cmd);
    if (commandobj.highscore) {
      if (!this.highscores[commandobj.cmd]) { //this will probably never be true
        this.highscores[commandobj.cmd] = {
          user: { _id: "", name: "Anonymous", color: "#777" },
          highscore: "999",
        }
      } else {
        this.highscores[commandobj.cmd] = {
          user: user,
          highscore: highscore
        };
      }
    }
    this.updatedb();
  }

  async updateBan(_id, ban) {
    if (!this.ranks["banned"].hasOwnProperty(_id) && ban == true) {
      this.ranks["banned"][_id] = _id
      this.updatedb();
    } else if (this.ranks["banned"].hasOwnProperty(_id) && ban == false) {
      delete this.ranks["banned"][_id];
      this.updatedb();
    }
  }


  async updatedb() {
    await fs.writeFile('src/db/ranks.json', JSON.stringify(this.ranks, null, 2), (err) => {
      if (err) {
        throw err;
      }
    });
    await fs.writeFile('src/db/fishingdb.json', JSON.stringify(this.fishingdb, null, 2), (err) => {
      if (err) {
        throw err;
      }
    });

    await fs.writeFile('src/db/highscores.json', JSON.stringify(this.highscores), (err) => {
        if(err) {
          throw err;
        }
      });
  }

  changeMode(mode, user, cmd, type, data, ms, msg, message) {
    if (mode == "cmd") {
      this.cmode = {
        user: {
          _id: "",
          name: "",
          color: "#777"
        },
        mode: "cmd",
        cmd: null,
        data: null,
        msg: null
      }
    } else {
      this.cmode = {
        user: user,
        mode: "sfunc",
        type: type,
        cmd: cmd,
        data: data,
        ms: ms,
        msg: msg
      }
      this.gameTimer(ms, data, cmd, message);
    }
  }

  gameTimer(ms, data, cmd, msg) {
    setTimeout(() => {
      if (this.cmode.mode != "cmd" && data == this.cmode.data && cmd == this.cmode.cmd) {
        this.sendChat(msg.channel.id,this.cmode.msg)
        this.changeMode("cmd");
      }
    }, ms)
  }

  addFisher(msg,usr, kek, fake) {
    if (!this.fishing.hasOwnProperty(usr._id)) {
      this.fishing[usr._id] = {
        "_id": usr._id
      };
    }
    if (!this.fishing[usr._id].hasOwnProperty('timeout')) {
      if (!fake) {
        this.fishing[usr._id].castedtime = Date.now();
      }
      if (this.kekklepeeps.hasOwnProperty(usr._id)) kek = true;
      //console.log(kek)
      this.fishing[usr._id].timeout = setTimeout(() => {
       // if (this.getUsersByNameOrId(msg.channel,usr._id).length != 0) {        
          let fishy_size = this.fishnames.fish_sizes.random();
          let fish_caught = this.fishnames.fish.random();
          this.sendChat(msg.channel.id,`Our good friend ${usr.name} caught a ${fishy_size} ${fish_caught}! ready to /eat or /fish again`);
          this.addFishToSack(usr, fish_caught, fishy_size);
          delete this.fishing[usr._id].timeout;
          if (kek) delete this.kekklepeeps[usr._id];
          this.updatedb();
       // }
      }, !kek ? Math.floor(Math.random() * (1000 * 60 * 5)) : Math.floor(Math.random() * (1000 * 60 * 3)))
      this.updatedb();
      return true;
    } else {
      return false;
    }
  }

  removeFisher(usr) {
    if (!this.fishing.hasOwnProperty(usr._id)) {
      throw new Error("can't remove fisher that doesn't exist!");
    }
    if (!this.fishing[usr._id].hasOwnProperty('timeout')) {
      return false;
    } else {
      clearTimeout(this.fishing[usr._id].timeout);
      delete this.fishing[usr._id].timeout;
      this.updatedb();
      return true;
    }
  }
  addFishToSack(usr, fish, fish_size) {
    console.log(usr, fish);
    if (!this.fishingdb.caught.hasOwnProperty(usr._id)) {
      this.fishingdb.caught[usr._id] = {
        "_id": usr._id,
        "name": usr.name
      };
    }    
    if (!this.fishingdb.caught[usr._id].hasOwnProperty(fish)) {
      this.fishingdb.caught[usr._id][fish] = {
        "name": fish,
        "howmany": 1,
        "size": fish_size
      }
      this.updatedb();
      return 'ofo';
    }
    this.fishingdb.caught[usr._id][fish] = {
      "name": fish,
      "howmany": ++this.fishingdb.caught[usr._id][fish].howmany,
      "size": fish_size
    }
    this.updatedb();
  }
  getFishByName(name, user) {
    if (!this.fishingdb.caught.hasOwnProperty(user.id.chat_id)) {
      return [];
    }
    let fishes = Object.assign({},this.fishingdb.caught[user.id.chat_id]);
    delete fishes.name;
    delete fishes._id;
    fishes = Object.values(fishes);
    return fishes.filter((fish) => fish.name.toLowerCase().includes(name.toLowerCase()));
  }
  giveOrBestowFish(msg,sender, num, prsontogive, fishname, type) {
    let user = [];
    if (type == 'give') {
      user = this.getUsersByNameOrId(msg.channel,prsontogive);
    } else {
      user = this.getUsersByNameOrId(msg.channel,prsontogive);
    }
    if (user.length <= 0) {
      this.sendChat(msg.channel.id,`Friend ${sender.name} missed`);
      return;
    }
    user = user[Math.floor(Math.random() * user.length)];
    if (user.id.chat_id == sender.id.chat_id)  {
      this.sendChat(msg.channel.id,`Friendly friend ${sender.name} messed up`);
      return;
    }
    if (!num) {
      if (fishname != null) {
        let fishes = this.getFishByName(fishname, sender);
        if (fishes.length > 0) {
          this.transferFishes(msg,1, fishes, user, sender, type)
        } else {
          this.sendChat(msg.channel.id,`Friend ${sender.name}: You don't have the fish to ${type == 'give' ? 'give' : 'bestow'}.`);
          return;
        }
      } else {
        if (!this.fishingdb.caught.hasOwnProperty(sender.id.chat_id)) {
          this.sendChat(msg.channel.id,`Friend ${sender.name}: You don't have the fish to ${type == 'give' ? 'give' : 'bestow'}.`);
          return;
        }
        let fishes = Object.assign({},this.fishingdb.caught[user.id.chat_id]);
        delete fishes.name;
        delete fishes._id;
        this.transferFishes(msg,1, Object.values(fishes), user, sender, type)
      }
    } else {
      if (fishname != null) {
        let fishes = this.getFishByName(fishname, sender);
        let fishnum = 0;
        fishes.forEach((b) => {
          if (typeof b === 'object') {
              fishnum += b.howmany;
          }
        });
        if (fishes.length > 0) {
          if (num > fishnum) {
            this.sendChat(msg.channel.id,`Friend ${sender.name}: You don't have ${num} ${fishname}.`)
            return;
          }
          this.transferFishes(msg,num, fishes, user, sender, type)
        } else {
          this.sendChat(msg.channel.id,`Friend ${sender.name}: You don't have ${num} ${fishname}.`)
          return;
        }
      } else {
        if (!this.fishingdb.caught.hasOwnProperty(msg.p._id)) {
          this.sendChat(msg.channel.id,`Friend ${sender.name}: You don't have ${num} .`);
          return;
        }
        let fishnum = 0;
        let fishes = this.fishingdb.caught[sender.id.chat_id];
        delete fishes.name;
        delete fishes._id;
        fishes.forEach((b) => {
          if (typeof b === 'object') {
              fishnum += b.howmany;
          }
        });
        if (num > fishnum) {
          this.sendChat(msg.channel.id,`Friend ${sender.name}: You don't have ${num} .`)
          return;
        }
        this.transferFishes(msg,num, Object.values(fishes), user, sender, type)
      }
    }
  }
  transferFishes(msg,num, fishes, user, sender, type) {
    //console.log(num, fishes, user, sender, type)
    if (!this.fishingdb.caught.hasOwnProperty(user.id.chat_id)) {
      this.fishingdb.caught[user.id.chat_id] = {
        "_id": user.id.chat_id,
        "name": user.fallback_name
      };
      this.fishingdb.caught[sender.id.chat_id].name = sender.name; this.fishingdb.caught[sender.id.chat_id]._id = sender.id.chat_id;
    }
    let j = 0;
    for (let i = 0; i < num; i++) {
      let fish = fishes[j];
      let fishname = fish.name;
      if (fish.howmany > 1) { //remove fish from sender
          --this.fishingdb.caught[sender.id.chat_id][fishname].howmany;
          this.updatedb();         
      } else {
          delete this.fishingdb.caught[sender.id.chat_id][fishname];
          j++;
          this.updatedb();
      }
      console.log(user,fish.name, fish.size)
      this.addFishToSack(user, fish.name, fish.size); //add to user's stack
    }
    if (num == 1) { 
     // console.log(type)
      this.sendChat(msg.channel.id,`Our friend ${sender.name} ${type == 'give' ? 'gave' : 'bestowed'} ${user.fallback_name} his/her ${fishes[0].name}`);
    } else {
      this.sendChat(msg.channel.id,`Our friend ${sender.name} ${type == 'give' ? 'gave' : 'bestowed'} ${user.fallback_name} his/her e.g. (${fishes[0].name}${fishes[0].name == "kekklefruit" ? "" : ` (${fishes[0].size})`}) x ${num}.`);
    }
    

  }
  kekkleinterval() {
    setTimeout(() => {
      if (!(this.kekklefruit >= 10))  {
        ++this.kekklefruit;
      }
      this.kekkleinterval();
    }, 1000 + Math.random() * 120 * (1000 * 60))
  }
  addKekkleFruitPerson(msg,usr) {
    this.kekklepeeps[usr._id] = usr;
    if (this.fishing.hasOwnProperty(usr._id)) {
      this.removeFisher(usr);
      this.addFisher(msg,usr, true, true);
    };  
  }

  doStuff() {
    //set owner in database
    //TODO add event handlers in own file
   
      //Object.values(msg.ppl).find((prsn) => prsn._id === this.client.getOwnParticipant()._id && prsn.name != this.desiredbotName) ? this.client.sendArray([{m:'userset', set: {name: this.desiredbotName}}]) : {};	  
  // setInterval(() => {
      /*if (!this.focused) {
        this.client.setfocus(this.client.chid, Client.FocusStatus.FOCUSED, 1); 
        this.focused = true;
      } else {
        this.focused = false;
        this.client.setfocus("UgzZotDyAeF5qFug_th4AaABAQ", Client.FocusStatus.FOCUSED, 1);
      }*/
      //this.client.sendeasteregg("UgwKgON1yvMnP812VUJ4AaABAQ", "bikeshed");
    //},500)
    

    

  }

}