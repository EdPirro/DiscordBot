const fs = require("fs")
const Discord = require('discord.js');
const { prefix, token } = require("./config.json")
const nums = {'\u0031\u20E3': 1, '\u0032\u20E3': 2, '\u0033\u20E3': 3, '\u0034\u20E3': 4, '\u0035\u20E3': 5, '\u0036\u20E3': 6, '\u0037\u20E3': 7, '\u0038\u20E3': 8, '\u0039\u20E3': 9, '\u0040\u20E3': 10};

//Create VARIABLES
const client = new Discord.Client()
client.commands = new Discord.Collection()
const cooldowns = new Discord.Collection();
const polls = new Discord.Collection();


//CREATE COMMAND COLLECTION
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"))

for (const file of commandFiles){
  const command = require(`./commands/${file}`)
  client.commands.set(command.name, command);
  if(command.alias) for(const alias of command.alias) client.commands.set(alias, command);
  //Create cooldown collection as well
  if(command.hasCooldown) cooldowns.set(command.name, new Discord.Collection())
}

// Just some debug stuff, but still some good infos
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}! prefix: ${prefix}`)
})

client.on("message", msg => {

  //if the message doesn't starts with the prefix or was sent by the bot it's ignored
  if (!msg.content.startsWith(prefix) || msg.author.bot) return

  // gets every word entered and ignore aditioal space between words.
  const msgEveryWord = msg.content.slice(prefix.length).split(/ +/); 

  // gets the command name as being the first thing after the prefix and before the first blank space
  const commName =  msgEveryWord.shift();

  // checks if the command exists
  if (client.commands.has(commName)){
    const comm = client.commands.get(commName) // gets the command itself
    
    // joins every word together (with only one space between then) and then splits for every comma
    const args = msgEveryWord.length ? msgEveryWord.join(' ').split(',') : [];

    //ARGUMENTS CHECK
    if(comm.args){

      // just for debug porpouses
      console.log(`Command: ${commName}\nArgs: ${args}`);

      let replyMsg = ""; // set-up the reply message (to send if some error occur)
      
      if(comm.args === "unique" && args.length !== comm.argsNum){
        replyMsg = `Número errado de argumentos para o comando ${comm.name}`;
        if(comm.usage) replyMsg += `, a utilização coreta eh:\n${prefix}${comm.usage}`;
        return msg.reply(replyMsg);
      }
      else if( comm.args === "multiple" &&
          ((argNum, argLen) => {
              for(const i of argNum) 
                if(i === argLen) 
                  return false
              return true
          })(comm.argsNum, args.length)
      ) {
        replyMsg = `Número errado de argumentos para o comando ${comm.name}`;
        if(comm.usage) replyMsg += `,\n a utilização coreta eh:\n${prefix}${comm.usage}`;
        return msg.reply(replyMsg);
      }
    }

    try {

      //COOLDOWN CHECK
      if(cooldowns.has(comm.name)){
        
        //Cooldown Treatment
        if(cooldowns.get(comm.name).has(msg.author.id)){

          const expirationTime = cooldowns.get(comm.name).get(msg.author.id) + (comm.cooldown * 1000)
          const now = Date.now()
          if(now < expirationTime){
            const timeLeft = (expirationTime - now) / 1000
            return msg.channel.send(`Ei ei, ${msg.author.username}, vamos com calma aqui amigão, o comando precisa de mais ${Math.round(timeLeft * 100) / 100} segundos pra recuperar o folego!`)
          }
        }

        //EXECUTION
        cooldowns.get(comm.name).set(msg.author.id, Date.now());
        setTimeout(() => cooldowns.get(comm.name).delete(msg.author.id), (comm.cooldown * 1000));
      }
      
      // executes the command if it isn't in cooldown for the user
      comm.execute(client, msg, args, polls);

    } catch (error) {

      //EXECUTION ERROR
      console.error(error);
      msg.reply("Erro na execução do comando " + comm.name + " :(.");
    }
  } else {
    // reply a message saying the entered command dossen't exists and deletes it after 5 seconds
    msg.reply("Esse comando não existe").then(msg => msg.delete(5000)).catch(err => console.log("Mensagem não apagada."));
  }
  msg.delete(5000).catch(err => console.log("Mensagem não apagada."));
});

// vote with reactions stuff
client.on('messageReactionAdd', (reaction, user) => {
  try {
    const msg = reaction.message;
    if(user.bot || !msg.author.bot) return;
    if(msg.embeds.length === 1) {
      const embed = msg.embeds[0];
      if(polls.has(embed.title)){
        const poll = polls.get(embed.title);
        if(!poll.available) return msg.channel.send(`As votações ja foram encerradas...`, {reply: user});
        if(poll.userVoted[user.id]) return msg.channel.send(`Você ja votou nessa poll`, {reply:  user});
        const op = nums[reaction.emoji.name];
        if(op === undefined) return;
        let choice = null;
        for(const i in poll.options)
          if(poll.options[i].id === op) {
              poll.options[i].count++;
              choice = i;
              break;
          }
        if(choice === null) return msg.channel.send(`Não existe essa opção`, {reply:  user});
        poll.userVoted[user.id] = choice;
        msg.channel.send(`Voto computado com sucesso! :D`, {reply:  user}).then(msg => setTimeout(() => msg.delete(), 5000)).catch(err => console.log("Mensagem não apagada."));
        let show = client.commands.get('show');
        return show.execute(client, msg, [poll.name], polls);

      }
    }

  } catch (error) {
    console.log(error);
    msg.reply('some error ocurred:/');
  }  
});

// just a simple replying to the user funcionality (idk I like it)
client.on('message', msg => {
  if(msg.mentions.users.has(client.user.id)) {
    if(Math.floor(Math.random() * 5) == 0) return msg.reply(`Fala ai man`); // 25% (100/(n - 1) com n = 5 ) chance de responder;
  }
});

//logs in
client.login(token).catch(err => console.log(err, '\n\n', '--> You probably didn\'t set your token correctly'));


process.on('SIGINT', () => {
  console.log('finished with ctrl-c');
  process.exit();
});
