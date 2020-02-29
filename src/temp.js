const Client = require('hangupsjs');
module.exports = function () {
  this.addCommand = async (cmd, usage, minargs, func, minrank, hidden, secondfunc, highscore) => {
    this.commands.push({
      cmd: cmd,
      usage: usage,
      minargs: minargs,
      func: func,
      minrank: minrank,
      hidden: hidden,
      secondfunc: secondfunc,
      highscore: highscore
    });
  }
  this.addCommand("help", `Usage: CMDCHARhelp`, 0, msg => {
    let bld = new Client.MessageBuilder();
    let cmds = new Client.MessageBuilder();
    let segments = bld.bold('F̲i̲s̲h̲i̲n̲g̲: ').linebreak()
      .bold(`/fish, /cast`).text(` (starts fishing),`).linebreak()
      .bold('/reel').text(' (stops fishing), ').linebreak()
      .bold('/caught').text(' (shows fish you\'ve caught),').linebreak()
      .bold("/count_fish").text(" (count the fish you've caught),").linebreak()
      .bold("/fish_count").text(" (show fish records),").linebreak()
      .bold("/eat").text(" (eats one of your fish),").linebreak()
      .bold("/give [name]").text(" (gives fish to someone else),").linebreak()
      .bold("/give_[number] [name]").text(" (give up to 100 at a time),").linebreak()
      .bold("/pick").text(" (picks fruit from the tree),").linebreak()
      .bold("/tree").text(" (shows number of fruit left on the tree).").toSegments();

    let commands = cmds.bold("C̲o̲m̲m̲a̲n̲d̲s̲: ").linebreak()
      .bold("/fishing").text(" (View Fishing Commands),").linebreak()
      .bold("/typerace").text(" (type as fast as you can!),").linebreak()
      .bold("/cat").text(" Displays a cat picture!,").linebreak()
      .bold("/hedgehog").text(" Sends hedgehog emoji,").linebreak()
      .bold("/beans").text(" (BEANS!!!!)").toSegments();
    this.sendChat(msg.channel.id, commands)
  }, 0, false)

  this.addCommand("fishing", `Usage: CMDCHARfishing`, 0, msg => {
    let bld = new Client.MessageBuilder();
    let segments = bld.bold('F̲i̲s̲h̲i̲n̲g̲: ').linebreak()
      .bold(`/fish, /cast`).text(` (starts fishing),`).linebreak()
      .bold('/reel').text(' (stops fishing), ').linebreak()
      .bold('/caught').text(' (shows fish you\'ve caught),').linebreak()
      .bold("/count_fish").text(" (count the fish you've caught),").linebreak()
      .bold("/fish_count").text(" (show fish records),").linebreak()
      .bold("/eat").text(" (eats one of your fish),").linebreak()
      .bold("/give [name]").text(" (gives fish to someone else),").linebreak()
      .bold("/give_[number] [name]").text(" (give up to 100 at a time),").linebreak()
      .bold("/pick").text(" (picks fruit from the tree),").linebreak()
      .bold("/tree").text(" (shows number of fruit left on the tree).").toSegments();

    this.sendChat(msg.channel.id, segments)
  }, 0, false)
  // Friend ＡＴＬＡＳ - a book of maps or charts.: By my count, there are 27079 fish in the fish sacks. The largest sacks are: 1. Chacha–㉖: 18380, 2. Үоѕһі𝟣𝟤𝟤𝟫﹝Typhoon undefined﹞: 381, 3. Milk: 226
  //Friend 1: You have no food. /fish to get some.
  this.addCommand(["fish", "cast"], `Usage: CMDCHARfish`, 0, msg => {
    function timeConversion(millisec) {
      var minutes = (millisec / (1000 * 60)).toFixed(1);
      return minutes;
    }
    let timespentfishing;
    if (this.fishing.hasOwnProperty(msg.p._id)) {
      if (this.fishing[msg.p._id].hasOwnProperty('castedtime')) {
        timespentfishing = timeConversion(Date.now() - this.fishing[msg.p._id].castedtime);
      }
    }
    if (this.addFisher(msg, msg.p)) {
      this.sendChat(msg.channel.id, `${msg.p.name} casts LURE into a water for catching fish.`);
    } else {
      this.sendChat(msg.channel.id, `Friend ${msg.p.name}: Your lure is already in the water (since ${timespentfishing} minutes ago).`)
    }
  }, 0, false)

  this.addCommand("reel", `Usage: CMDCHARreel`, 0, msg => {
    if (!this.fishing.hasOwnProperty(msg.p._id)) {
      this.sendChat(msg.channel.id, `Friend ${msg.p.name}: You haven't /casted it.`)
      return;
    }
    if (this.removeFisher(msg.p)) {
      this.sendChat(msg.channel.id, `${msg.p.name} reel his/her lure back inside, temporarily decreasing his/her chances of catching a fish by 100%.`);
    } else {
      this.sendChat(msg.channel.id, `Friend ${msg.p.name}: You haven't /casted it.`)
    }

  }, 0, false)

  this.addCommand(["sack", "caught"], `Usage: CMDCHARsack [name or _id]`, 0, msg => {
    function sendSack(user, bot) {
      console.log(user.id)
      if (!bot.fishingdb.caught.hasOwnProperty(user.id.chat_id)) {
        bot.sendChat(msg.channel.id, `Contents of ${user.fallback_name}'s fish sack: (none)`);
        return;
      }
      let fishnum = 0;
      Object.values(bot.fishingdb.caught[user.id.chat_id]).forEach((b) => {
        if (typeof b === 'object') {
          fishnum += b.howmany;
        }
      });
      let fish_counts = {};
      fish_counts[user.id.chat_id] = {
        "_id": user.id.chat_id,
        "name": user.fallback_name,
        "count": fishnum
      }
      if (Object.values(fish_counts)[0].count == 0) {
        bot.sendChat(msg.channel.id, `Contents of ${user.fallback_name}'s fish sack: (none)`);
        return;
      }
      let fishsack = `Contents of ${user.fallback_name}'s fish sack: `;
      Object.values(bot.fishingdb.caught[user.id.chat_id]).forEach((fish) => {
        if (typeof fish == 'object') {
          fishsack = fishsack.concat(`◍${fish.name} x${fish.howmany}, `);
        }
      })
      fishsack = replaceAt(fishsack, fishsack.length - 2, ".");
      //console.log(fishsack)
      fishsack = fishsack.replace(/,(?=[^,]*$)/, ' and ');
      for (let sack of fishsack.match(/.{1,512}/g)) {
        bot.sendChat(msg.channel.id, sack);
      }
    }
    if (msg.args.length - 1 > 0) {
      let user = this.getUsersByNameOrId(msg.channel, msg.args[1]);
      if (user.length <= 0) {
        sendSack(msg.p, this)
        return;
      }
      user = user[Math.floor(Math.random() * user.length)];
      //console.log(user);
      sendSack(user, this);
    } else {
      sendSack(msg.p, this);
    }
  }, 0, false)

  this.addCommand(["count_fish"], `Usage: CMDCHARcount_fish [name or _id]`, 0, msg => {
    function sendSack(user, bot) {
      if (!bot.fishingdb.caught.hasOwnProperty(user.id.chat_id)) {
        bot.sendChat(msg.channel.id, `Friend ${msg.p.name}: By my count, ${msg.p.name} has 0 fish.`);
        return;
      }
      let fishnum = 0;
      let fishes = Object.assign({}, bot.fishingdb.caught[user.id.chat_id]);
      delete fishes.name;
      delete fishes._id;
      fishes = Object.values(fishes);
      fishes.forEach((b) => fishnum += b.howmany);
      bot.sendChat(msg.channel.id, `Friend ${msg.p.name}: By my count, ${user.fallback_name} has ${fishnum} fish.`);
    }
    if (msg.args.length - 1 > 0) {
      let user = this.getUsersByNameOrId(msg.channel, msg.args[1]);
      if (user.length <= 0) {
        sendSack(msg.p, this)
        return;
      }
      user = user[Math.floor(Math.random() * user.length)];
      //console.log(user);
      sendSack(user, this);
    } else {
      sendSack(msg.p, this);
    }
  }, 0, false)

  this.addCommand(["fish_count"], `Usage: CMDCHARfish_count`, 0, msg => {
    if (this.fishingdb.caught.hasOwnProperty(msg.p._id)) {
      if (!this.fishingdb.caught[msg.p._id].hasOwnProperty("name") || !this.fishingdb.caught[msg.p._id].hasOwnProperty("_id")) {
        this.fishingdb.caught[msg.p._id].name = msg.p.name;
        this.fishingdb.caught[msg.p._id]._id = msg.p._id;
        this.updatedb();
      }
    }
    let fish_counts = {};
    for (let fisher of Object.values(this.fishingdb.caught)) {
      let fishnum = 0;
      try {
        Object.values(this.fishingdb.caught[fisher._id]).forEach((b) => {
          //console.log(typeof b, b);
          if (typeof b === 'object') {
            fishnum += b.howmany;
          }
        });
      } catch (e) {
        //laf
      }
      //console.log(this.fishingdb.caught[fisher._id])
      fish_counts[fisher._id] = {
        "_id": fisher._id,
        "name": fisher.name,
        "count": fishnum
      }
    }
    let highscores = Object.values(fish_counts).sort((a, b) => b.count - a.count);
    //console.log(highscores);
    let totalfish = highscores.reduce((a, b) => a + (b["count"] || 0), 0);
    if (highscores.length < 3) {
      this.sendChat(msg.channel.id, `Friend ${msg.p.name}: They're aren't enough fish in the fish sacks.`)
      return;
    }
    this.sendChat(msg.channel.id, `Friend ${msg.p.name}: By my count, there are ${totalfish} fish in the fish sacks. The largest sacks are: 1. ${highscores[0].name}: ${highscores[0].count}, 2. ${highscores[1].name}: ${highscores[1].count}, 3. ${highscores[2].name}: ${highscores[2].count}`);
  }, 0, false)

  this.addCommand(["eat"], `Usage: CMDCHAReat [fish]`, 0, msg => {
    let taste = this.fishnames.fishtastes.random();

    if (!this.fishingdb.caught.hasOwnProperty(msg.p._id)) {
      this.sendChat(msg.channel.id, `Friend ${msg.p.name}: You have no food. /fish to get some.`);
      return;
    }
    let fish_counts = {};
    let fishnum = 0;
    Object.values(this.fishingdb.caught[msg.p._id]).forEach((b) => {
      if (typeof b === 'object') {
        fishnum += b.howmany;
      }
    });
    fish_counts[msg.p._id] = {
      "_id": msg.p._id,
      "name": msg.p.name,
      "count": fishnum
    }
    if (Object.values(fish_counts)[0].count == 0) {
      this.sendChat(msg.channel.id, `Friend ${msg.p.name}: You have no food. /fish to get some.`);
      return;
    }

    function getFish(bot) {
      delete bot.fishingdb.caught[msg.p._id]._id && delete bot.fishingdb.caught[msg.p._id].name;
      let fish = Object.values(bot.fishingdb.caught[msg.p._id]).random();
      return fish;
    }
    if (msg.args.length - 1 > 0) {
      let fishtoeat = this.getFishByName(msg.args[1], msg.p);
      if (fishtoeat.length <= 0) {
        this.sendChat(msg.channel.id, `Friend ${msg.p.name}: You don't have ${msg.args[1]}.`);
        return;
      }
      fishtoeat = fishtoeat[Math.floor(Math.random() * fishtoeat.length)];
      let fish = fishtoeat;
      let fishname = fish.name;
      if (fish.howmany > 1) {
        --this.fishingdb.caught[msg.p._id][fishname].howmany;
        this.updatedb();
      } else {
        delete this.fishingdb.caught[msg.p._id][fishname];
        this.updatedb();
      }
      if (fishname == "kekklefruit") {
        this.sendChat(msg.channel.id, `Our friend ${msg.p.name} ate his/her ${fishname} and got a temporary fishing boost.`);
        this.addKekkleFruitPerson(msg, msg.p._id);
      } else {
        this.sendChat(msg.channel.id, `Our friend ${msg.p.name} ate ${fishname}. It tasted ${taste}.`);
      }
    } else {
      let fish = getFish(this);
      // console.log(fish);
      let fishname = fish.name;
      if (fish.howmany > 1) {
        --this.fishingdb.caught[msg.p._id][fishname].howmany;
        this.updatedb();
      } else {
        delete this.fishingdb.caught[msg.p._id][fishname];
        this.updatedb();
      }
      if (fishname == "kekklefruit") {
        this.sendChat(msg.channel.id, `Our friend ${msg.p.name} ate his/her ${fishname} and got a temporary fishing boost.`);
        this.addKekkleFruitPerson(msg, msg.p);
      } else {
        this.sendChat(msg.channel.id, `Our friend ${msg.p.name} ate ${fishname}. It tasted ${taste}.`);
      }
    }

  }, 0, false)
  //Friendly friend Bop It fudged /give <yourself>
  //Friend Bop It missed /bestow or user not found
  //Our friend Boi gave Bop It his/her Helmet ton /give Bop Helmet   or random if no args[2]
  //Friend fishing/OURnymous[4]: You don't have the fish to give. fish not found
  //Friend fishing/OURnymous[5]: You don't have 3 . /give_3 <user> but user doesn't have 3 fish.
  //Friend xelA: You don't have 20 me. /give_20 <user> me not enough of a certain fish
  this.addCommand(["give"], `Usage: CMDCHARgive [name] [fish]`, 0, msg => {
    if (msg.args.length - 1 > 0) {
      if (msg.args.length == 1) {
        this.giveOrBestowFish(msg, msg.p, msg.givenum, msg.args[1], null, 'give');
      } else {
        this.giveOrBestowFish(msg, msg.p, msg.givenum, msg.args[1], msg.input(2), 'give');
      }
    } else {
      this.sendChat(msg.channel.id, `Friend ${msg.p.name} missed`);
    }
  }, 0, false)

  this.addCommand(["bestow"], `Usage: CMDCHARbestow [participant id] [fish]`, 0, msg => {
    if (msg.args.length - 1 > 0) {
      if (msg.args.length == 1) {
        this.giveOrBestowFish(msg, msg.p, msg.givenum, msg.args[1], null, 'bestow');
      } else {
        this.giveOrBestowFish(msg, msg.p, msg.givenum, msg.args[1], msg.input(2), 'bestow');
      }
    } else {
      this.sendChat(msg.channel.id, `Friend ${msg.p.name} missed`);
    }
  }, 0, false)

  this.addCommand(["pick"], `Usage: CMDCHARpick`, 0, msg => {
    //Our friend [discord.gg/k44Eqha] picked 1 fruit from the kekklefruit tree and placed it into his/her fish sack.
    if (this.kekklefruit > 0) {
      this.sendChat(msg.channel.id, `Our friend ${msg.p.name} picked 1 fruit from the kekklefruit tree and placed it into his/her fish sack.`);
      --this.kekklefruit;
      this.addFishToSack(msg.p, "kekklefruit", "idk");
    } else {
      this.sendChat(msg.channel.id, this.fishnames.nofruit[Math.floor(Math.random() * this.fishnames.nofruit.length)]);
    }
  }, 0, false)

  this.addCommand(["tree"], `Usage: CMDCHARtree`, 0, msg => {
    this.sendChat(msg.channel.id, `Friend ${msg.p.name}: ${this.kekklefruit}`);
  }, 0, false)

  this.addCommand(["beans"], `Usage: CMDCHARbeans`, 0, msg => {
    if (!this.beansInterval) {
      if (msg.p.rank.id >= 2) {
        const words = require('categorized-words')
        this.sendChat(msg.channel.id, "BEANS INCOMING!!!")
        this.beansInterval = setInterval(() => {
          this.sendChat(msg.channel.id, words.A[Math.floor(Math.random() * words.A.length)] + " beans");
        }, 10000)
      } else {
        this.sendChat(msg.channel.id, "Sorry, you must be an Admin or higher to start the beans. You can only stop the the beans.")
      }
    } else {
      this.sendChat(msg.channel.id, "Stopping...");
      clearInterval(this.beansInterval);
      this.beansInterval = undefined;
    }
  }, 2, false)

  this.addCommand(["hedgehog"], `Usage: CMDCHARhedgehog`, 0, msg => {
   this.sendChat(msg.channel.id,"🦔");
  }, 0, false)

  this.addCommand(["meme"], `Usage: CMDCHARmeme`, 0, msg => {
    request(`https://api.imgflip.com/get_memes`, (error, response, body) => {
      if (error) {
        this.sendChat(`Uh oh! An error occured: ${error.toString()}`)
        return;
      }
      console.log("Got JSON ");
      let memes = JSON.parse(body).data.memes;
      console.log(`${memes.length} memes.`)
      let meme = memes[Math.floor(Math.random() * memes.length)]
      request(meme.url, (error, response, body) => {
        if (error) {
          this.sendChat(`Uh oh! An error occured: ${error.toString()}`)
          return;
        }
      }).on('end', () => {
        console.log(`Writing ${meme.url} to file...`);

      }).pipe(fs.createWriteStream(`tempimg.jpg`).on('finish', async () => {
        console.log("Done!")
        let img_id = await this.client.uploadimage("tempimg.jpg");
        this.sendChat(msg.channel.id, meme.name, img_id);
      }))
    })
  }, 0, false)

  this.addCommand(["cat"], `Usage: CMDCHARcat`, 0, async msg => {
    let res = require('../cats.json').cats;
    let texts = [
      "How about this feline friend?",
      "Check out this cutie!",
      "Here's a nice furry friend!"
    ]
    let img_id = await this.client.uploadimage(res[Math.floor(Math.random() * res.length)]);
    this.sendChat(msg.channel.id, texts[Math.floor(Math.random() * texts.length)], img_id);
  }, 0, false)

  this.addCommand("typerace", `Usage: CMDCHARtyperace`, 0, msg => {
    this.sendChat(msg.channel.id, "The Typerace game has started, get ready!");
    var duhword = require('random-words')();
    const prettyMs = require('pretty-ms');
    this.changeMode("sfunc", msg.p, "typerace", "all", {
      word: duhword,
      prettyMs: prettyMs
    }, 30000, "30 seconds is up! Type racing game is over.", msg);
    setTimeout(() => {
      this.sendChat(msg.channel.id, `Type ${duhword} as fast as possible!`);
      this.cmode.data.seconds = Date.now(); //start timer when send chat
    }, 1)
  }, 0, false, msg => {
    if (msg.data.word == msg.a) {
      if (msg.data.seconds) { //no undefined
        let ms = msg.data.prettyMs(Date.now() - msg.data.seconds, {
          secDecimalDigits: 3
        })
        ms.endsWith("m") ? ms = "0." + ms.split("m")[0] : {};
        let winmsg = `${msg.p.name} won the game in ${ms.split("s")[0]} seconds!`;
        if (this.highscores.typerace.highscore > ms.split("s")[0]) {
          winmsg = winmsg.concat(" NEW RECORD!");
          this.updateHighscores(msg.p, "typerace", ms.split("s")[0]);
        }
        this.sendChat(msg.channel.id, winmsg);
        this.changeMode("cmd");
      }
    }
  }, true)

  this.addCommand("promote", `Usage: CMDCHARpromote (_id or name) (rank)`, 2, msg => {
    let user = this.getUsersByNameOrId(msg.channel, msg.args[1]);
    if (user.length <= 0) {
      this.sendChat(msg.channel.id, "User Not found.");
      return;
    }
    user = user[Math.floor(Math.random() * user.length)];
    if (this.getRankById(user.id.chat_id).name == "Banned") {
      this.sendChat(msg.channel.id, "❌ Cannot promote user. User is banned.");
      return;
    }
    switch (msg.args[2]) {
      case "User":
      case "Helper":
      case "Admin": {
        let oldrank = this.getRankById(user.id.chat_id);
        let prm = "Promoted";
        if (oldrank.id == this.getRankIdByRankName(msg.args[2])) {
          this.sendChat(msg.channel.id, `${user.fallback_name} is already a ${oldrank.name}.`)
          break;
        }
        this.changeRank(user.id.chat_id, msg.args[2].toLowerCase() + "s").then((tonq) => {
          if (oldrank.id > this.getRankById(user.id.chat_id).id /* new rank */ )
            prm = "Demoted";
          this.sendChat(msg.channel.id, `${prm} ${user.fallback_name} from ${oldrank.name} to ${tonq}.`)
        }).catch((err) => {
          throw err;
        })
        break;
      }
      case "Owner": {
        this.sendChat(msg.channel.id, `You cannot promote someone to Owner.`);
      }
      default: {
        let tosend = `❌ There is no rank '${msg.args[2]}'. Ranks: `;
        Object.keys(this.ranks).forEach((rank) => {
          switch (rank) {
            case "owner": {
              break;
            }
            case "admins": {
              tosend += "Admin, ";
              break;
            }
            case "helpers": {
              tosend += "Helper, User.";
              break;
            }
          }
        })
        this.sendChat(msg.channel.id, tosend)
        break;
      }
    }


  }, 3, false)

  this.addCommand("eval", `Usage: CMDCHAReval (javascript)`, 0, msg => {
    try {
      this.sendChat(msg.channel.id, `Result: ${eval(msg.input(1))}`);
    } catch (e) {
      this.sendChat(msg.channel.id, `${e}`);
    }
  }, 3, false)

  this.addCommand("ban", `Usage: CMDCHARban (_id or name)`, 1, msg => {
    let user = this.getUsersByNameOrId(msg.channel, msg.args[1]);
    if (user.length <= 0) {
      this.sendChat(msg.channel.id, "User Not found.");
      return;
    }
    user = user[Math.floor(Math.random() * user.length)];
    if (this.getRankById(user.id.chat_id).name == "Banned") {
      this.sendChat(msg.channel.id, `${user.fallback_name} is already Banned.`);
      return;
    } else if (this.getRankById(user.id.chat_id).name == "Owner") {
      this.sendChat(msg.channel.id, `You cannot ban the Owner.`);
      return;
    } else {
      this.updateBan(user.id.chat_id, true).then(() => {
        this.sendChat(msg.channel.id, `Banned ${user.fallback_name}.`);
      }).catch((err) => {
        throw err;
      })
    }
  }, 2, false)

  this.addCommand("unban", `Usage: CMDCHARunban (_id or name)`, 1, msg => {
    let user = this.getUsersByNameOrId(msg.channel, msg.args[1]);
    if (user.length <= 0) {
      this.sendChat(msg.channel.id, "User Not found.");
      return;
    }
    user = user[Math.floor(Math.random() * user.length)];
    if (this.getRankById(user.id.chat_id).name != "Banned") {
      this.sendChat(msg.channel.id, `${user.fallback_name} isn't Banned.`);
      return;
    } else if (this.getRankById(user.id.chat_id).name == "Owner") {
      this.sendChat(msg.channel.id, `:thinking: Unbanned the Owner.`);
      return;
    } else {
      this.updateBan(user.id.chat_id, false).then(() => {
        this.sendChat(msg.channel.id, `Unbanned ${user.fallback_name}.`);
      }).catch((err) => {
        throw err;
      })
    }
  }, 2, false)

}