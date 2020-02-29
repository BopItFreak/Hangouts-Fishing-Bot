class Channel {
    constructor(bot, data) {
        this.data = data;
        this.id = data.id;
        this.bot = bot;
        this.ppl = data.ppl;
        
    }
    static get channels() {
        return Channel.Channels;
    }
    static set channels(d) {
        Channel.Channels = d;
    }
    static addChannel(data) {
        if (!Channel.channels.get(data.conversation_id.id)) {
            data.conversation.ppl = data.conversation.participant_data;
            data.conversation.id = data.conversation_id.id;
            Channel.channels.set(data.conversation_id.id,new Channel(this.bot, data.conversation))
            //console.log("NEW CHANNEL", data.conversation.type == "GROUP" ? data.conversation.name : "DM")
        }
    }
    static init(bot) {
        bot.client.on("client_conversation", (data) => {
            //console.log(!!data.participant_data, !!data.conversation_id.id)
            //if (!Channel.channels.get(data.conversation_id.id)) {
                data.ppl = data.participant_data;
                data.id = data.conversation_id.id;
                Channel.channels.set(data.conversation_id.id,new Channel(bot, data))
                //console.log("CHANNEL UPDATE", data.type == "GROUP" ? data.name : "DM")
            //}
        })
        bot.client.on("conversation_rename", msg => {
            /*if (msg.conversation_rename.new_name !== this.chatName) {
              this.client.renameconversation(this.client.chid, this.chatName)
            }     */
        })
    }
}
Channel.Channels = new Map();
module.exports = Channel;