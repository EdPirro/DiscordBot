const { prefix} = require("../config.json")

module.exports = {
    name        :   "help",
    alias       :    ['h'],
    description :   "Manda um DM com todos os comandos ou exibe informações sobre um comando especifico",
    args        :   "multiple",
    argsNum     :   [0, 1],
    hasCooldown :   true,
    cooldown    :   3,
    usage       :   "help <comando especifico (opcional)>",
    execute (client, msg, args, polls){
        let data = "";
        const { commands } = client
        if(!args.length){
            let reply = "Aqui está uma lista dos meus comandos:\n"
            data = (commands.map(command => `${prefix}${command.name}\nDescrição: ${command.description}`).join(",\n"))
            reply += data
            return msg.author.send(reply, { split: true})
                    .then(() => {
                        if(msg.channel.type !== "dm") msg.reply("Mandei um DM com as informações ;D")
                        else return
                    })
                    .catch(error => {
                        console.log("Não foi possivel enviar o DM", error)
                        msg.reply(" não estou conseguinto te mandar DM com as informações, será que não esta bloqueado?")
                    })
        }

        if(!commands.has(args[0])){
            return msg.reply("O comando buscado não existe :(")
        }

        const comm = commands.get(args[0])
        let reply = `Nome: ${comm.name}\nDescrição: ${comm.description}\n`
        if(comm.args){
            if(comm.args === "unique")
                reply += `Numero de argumentos necessarios: ${comm.argsNum}\n`
            else if (comm.args === "multiple")
                reply += `Numero de argumentos possiveis: ${comm.argsNum.join(", ")}\n`   
            else 
                reply += comm.argsInfo
        }
        if(comm.hasCooldown) reply += `Cooldown: ${comm.cooldown} segundos\n`
        if(comm.usage) reply += `Usagem: ${prefix}${comm.usage}\n`
        return msg.author.send(reply, { split: true})
                .then(() => {
                    if(msg.channel.type !== "dm") msg.reply("Mandei um DM com as informações ;D")
                    else return
                })
                .catch(error => {
                    console.log("Não foi possivel enviar o DM", error)
                    msg.reply(" não estou conseguinto te mandar DM com as informações, será que não esta bloqueado?")
                })

    }
}