module.exports = {
        name        :   'endPoll',
        alias       :    ['end', 'ep'],
        description :   'Finaliza a poll impossibilitando novos votos',
        args        :   'unique',
        argsNum     :   1,
        hasCooldown :   true,
        cooldown    :   3,
        usage       :   'endPoll [Nome da votação]',
        async execute(client, msg, args, polls) {  
            if(!polls.has(args[0].trim())) return msg.reply(`A poll buscada não existe :/`);
            const poll = polls.get(args[0].trim());
            if(msg.author.id !== poll.author.id) return msg.reply(`Apenas o criador da poll pode finalizá-la`);
            let reply = '';
            if(!poll.available) reply += `A votação ${poll.name} já terminou.`;
            else reply += `A votação ${poll.name} foi finalizada.`;
            poll.available = false;
            let max = {
                id         :    0,
                description:    '',
                count      :    -1      
            }
            for(const i in poll.options){
                if(poll.options[i].count > max.count) {
                    max.id = poll.options[i].id;
                    max.count = poll.options[i].count;
                    max.description = i;
                }
            }
            return msg.channel.send(reply + `\nA opção ${max.id} - ${max.description} ganhou com ${max.count} voto(s).`);
        }
}