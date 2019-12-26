const show  = require('./showPoll');

module.exports = {
    name        :   'votePoll',
    alias       :    ['vote', 'vp'],
    description :   'Permite o usuário a votar numa poll (caso não tenha votado ainda)',
    args        :   'unique',
    argsNum     :   2,
    hasCooldown :   true,
    cooldown    :   3,
    usage       :   'votePoll [Nome da votação], [Id | Descrição da opção]',
    async execute(client, msg, args, polls) {
        let pollRef = args.shift().trim();
        let poll = null;
        let choice = null;
        if(polls.has(pollRef)){
            poll = polls.get(pollRef);
            if(!poll.available) return msg.reply(`As votações ja foram encerradas...`);
            if(poll.userVoted[msg.author.id] !== undefined) return msg.reply(`Voce ja votou nessa poll. (voto: "${poll.userVoted[msg.author.id]}")`);
            let opId = Number(args[0].trim())
            if(!isNaN(opId)){
                for(const i in poll.options)
                    if(poll.options[i].id === opId) {
                        poll.options[i].count++;
                        choice = i;
                        break;
                    }
            }
            else {
                let option = poll.options[args[0].trim()];
                if(option !== undefined) {
                    option.count++;
                    choice = args[0].trim();
                }
            }
            if(choice) { 
                poll.userVoted[msg.author.id] = choice;
                msg.reply(`Voto computado com sucesso! :D`).then(msg => setTimeout(() => msg.delete(), 5000));
            }
            else msg.reply(`Opção inválida...`).then(msg => setTimeout(() => msg.delete(), 10000));
            return show.execute(msg, [poll.name], polls);
        }
        else return msg.reply(`A poll buscada não existe :/`);
    }
 }