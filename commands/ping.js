module.exports = {
    name        :   "ping",
    alias       :    ['p'],
    usage       :   "ping",
    description :   "Mostra o delay para o servidor em ms.",
    execute(client, msg, args, polls){
        msg.channel.send("```Pong " + Math.round(client.ping) + "ms```")
    }
}