const { createEmbed } = require("./startPoll.js")

module.exports = {
    name        :   "showPoll",
    alias       :    ['show', 'sp'],
    description :   "Mostra os resultados da votação indicada.",
    args        :   "unique",
    argsNum     :   1,
    hasCooldown :   true,
    cooldown    :   10,
    usage       :   "showPoll [Nome da votação]",
    async execute(client, msg, args, polls){
        if(!polls.has(args[0])) return msg.reply("a votação buscada não existe.");
        let poll = polls.get(args[0]);
        poll.showMsg.delete();
        poll.showMsg = await msg.channel.send(createEmbed(poll));
        const emojis = {1: '\u0031\u20E3' , 2: '\u0032\u20E3', 3: '\u0033\u20E3', 4: '\u0034\u20E3', 5: '\u0035\u20E3', 6: '\u0036\u20E3', 7: '\u0037\u20E3', 8: '\u0038\u20E3', 9: '\u0039\u20E3', 10: '\u0040\u20E3'};
        try {
            for(const i in poll.options) {
                await poll.showMsg.react(emojis[poll.options[i].id]);
            }
        } catch (error) {
            console.log(error);
            return msg.channel.send('Error reacting to msg');
        }   
    }
}