module.exports = {
    name        :   "ping",
    alias       :    ['p'],
    usage       :   "ping",
    description :   "Gives a pong and delay feedback",
    execute(client, msg, args, polls){
        msg.channel.send("```Pong " + Math.round(client.ping) + "ms```")
    }
}