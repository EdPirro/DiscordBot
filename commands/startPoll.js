const { prefix } = require('../config.json');

module.exports = {
    name        :   "startPoll",
    alias       :    ['start', 'stp'],
    description :   "Cria uma nova votação (se não existir nenhuma com o mesmo nome), 2-10 opções.",
    args        :   "special",
    argsInfo    :   "Esse comando aceita diferentes numeros de argumentos, use o comando help para mais informações sobre como usá-lo",
    hasCooldown :   true,
    cooldown    :   10,
    usage       :   "startPoll [Nome da votação], [Descrição (0 = nenhuma descrição)], [Opção 1], [Opção 2], ..., [Opção n], [Tempo de validade em segundos (0 = ilimitado)]",
    async execute(client, msg, args, polls){
        let poll = {}
        for(let i in args){
            args[i] = args[i].trim()
        }
        if(args.length < 5) return msg.reply(`Numero de argumento insuficientes.\nUsagem: ${prefix}${this.usage}`);
        if(args.length > 13) return msg.reply(`Muiots argumentos... a poll pode ter no máximo 10 opções.\nUsagem: ${this.usage}`);
        if(polls.has(args[0])) return msg.reply(`Já existe uma votação com esse titulo.`)
        poll.name = args.shift()
        args[0] === "0" ? args.shift() : poll.description = args.shift()
        try {
            const time = Number(args.pop())
            if(time !== 0) poll.time = time
        } catch(error) {
            return msg.reply(`Numero especificado para tempo de expiração invalido.\nUsagem: ${this.usage}`)
        }
        poll.options = {};
        let id = 1;
        for(const i of args){
            if(poll.options[i] !== undefined) continue;
            poll.options[i] = {};
            poll.options[i].count = 0;
            poll.options[i].id = id++;
        }
        if(id < 2) return msg.reply(`A votação precisa de no minimo duas opções distintas.\nUsagem: ${this.usage}`)
        poll.available = true;
        poll.timeStamp = Date.now();
        polls.set(poll.name, poll);
        if(poll.time) setTimeout(() => {
                if(polls.get(poll.name).available) {
                    msg.channel.send(`O tempo para a poll "${poll.name}" esgotou! Quem votou, votou, quem não votou, não vota mais`)
                    polls.get(poll.name).available = false;
                }
            }, poll.time * 1000);
        poll.author = {
            username: msg.author.username,
            id      : msg.author.id
        };
        poll.userVoted = {};
        msg.reply("Votação criada com sucesso!").then(msg => setTimeout(() => msg.delete(), 3000));
        poll.showMsg = await msg.channel.send(this.createEmbed(poll));
        const emojis = {1: '\u0031\u20E3' , 2: '\u0032\u20E3', 3: '\u0033\u20E3', 4: '\u0034\u20E3', 5: '\u0035\u20E3', 6: '\u0036\u20E3', 7: '\u0037\u20E3', 8: '\u0038\u20E3', 9: '\u0039\u20E3', 10: '\u0040\u20E3'};
        try {
            for(const i in poll.options) {
                await poll.showMsg.react(emojis[poll.options[i].id]);
            }
        } catch (error) {
            console.log(error);
            return msg.channel.send('Error reacting to msg');
        }   
    },
    createEmbed (poll){
        const Discord = require("discord.js")
        const embed = new Discord.RichEmbed()
                    .setColor('#0099ff')
                    .setTitle(poll.name);
        if(poll.description) embed.setDescription(poll.description);
        for(const key in poll.options){
            embed.addField(`${poll.options[key].id} - ${key}`, `Votos: ${poll.options[key].count}`);
        }
        let footer = "";
        if(poll.available) {
            footer = `As votações estão abertas! `;
            if(poll.time) footer += `Tempo restante = ${Math.round((poll.time - ((Date.now() - poll.timeStamp) / 1000)) * 100) / 100} segundos.`;
            else footer = "A votação tem tempo indeterminado." 
        } else footer = `Votações encerradas.`;
        footer += `\nVotação criada por: ${poll.author.username}`;  
        embed.setFooter(footer);
        return embed;
    }
}