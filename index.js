//Modules
const { Client, Collection,  } = require("discord.js");
const Discord = require('discord.js');
const client = new Discord.Client({partials: ["MESSAGE", "USER", "REACTION"]});
const config = require("./config.json");
const fs = require("fs");
const enmap = require('enmap');
const Enmap = require("enmap");
const db = require ("db");
const ms = require("ms");
const oldStateMap = new Map();


//Command Handler
client.commands = new Collection();
client.aliases = new Collection();
client.queue = new Map();
client.config = config;
client.points = new Enmap("points");


//Command Folder location
client.categories = fs.readdirSync("./commands/");

["command"].forEach(handler => {
 require(`./handlers/${handler}`)(client);
});

//Bot Status
client.on("ready", () => {
console.log(`Bot User ${client.user.username} has been logged in and is ready to use!`);
client.user.setActivity('Eagle Network | &help', { type: 'Playing' });
});


    client.on("message", async message => {
    //Loads prefix from config.json
    const prefix = (config.prefix);
    //Makes sure bot wont respond to other bots including itself
    if (message.author.bot) return;
    //Checks if the command is from a server and not a dm
    if (!message.guild) return;
    //Checks if the command starts with a prefix
    if (!message.content.startsWith(prefix)) return;
    //Makes sure bot wont respond to other bots including itself
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    
    if (cmd.length === 0) return;
    
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command) 
        command.run(client, message, args);
});


client.on('ready', () => {
    console.log('ready')
    client.user.setActivity('Eagle Network | &help', { type: 'WATCHING' });
});

client.on("message", message => {
  // As usual, ignore all bots.
  if (message.author.bot) return;

  // If this is not in a DM, execute the points code.
  if (message.guild) {
    // We'll use the key often enough that simplifying it is worth the trouble.
    const key = `${message.guild.id}-${message.author.id}`;

    // Triggers on new users we haven't seen before.
    client.points.ensure(`${message.guild.id}-${message.author.id}`, {
      user: message.author.id,
      guild: message.guild.id,
      points: 0,
      level: 1
    });

    client.points.inc(key, "points");

    // Calculate the user's current level
    const curLevel = Math.floor(0.1 * Math.sqrt(client.points.get(key, "points")));

    // Act upon level up by sending a message and updating the user's level in enmap.
    if (client.points.get(key, "level") < curLevel) {
      message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
      client.points.set(key, curLevel, "level");
    }
  }
  // Rest of message handler
   const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  if (command === "points") {
    const key = `${message.guild.id}-${message.author.id}`;
    return message.channel.send(`You currently have ${client.points.get(key, "points")} points, and are level ${client.points.get(key, "level")}!`);
  }
  
  if(command === "leaderboard") {
  // Get a filtered list (for this guild only), and convert to an array while we're at it.
  const filtered = client.points.filter( p => p.guild === message.guild.id ).array();

  // Sort it to get the top results... well... at the top. Y'know.
  const sorted = filtered.sort((a, b) => b.points - a.points);

  // Slice it, dice it, get the top 10 of it!
  const top10 = sorted.splice(0, 10);

  // Now shake it and show it! (as a nice embed, too!)
  const embed = new Discord.MessageEmbed()
    .setTitle("Leaderboard")
    .setAuthor(client.user.username, message.guild.iconURL())
    .setDescription("Our top 10 points leaders!")
    .setColor(0x00AE86);
  for(const data of top10) {
    try {
      embed.addField(client.users.cache.get(data.user).tag, `${data.points} points (level ${data.level})`);
    } catch {
      embed.addField(`<@${data.user}>`, `${data.points} points (level ${data.level})`);
    }
  }
  return message.channel.send({embed});
}
  
  if(command === "give") {
    // Limited to guild owner - adjust to your own preference!
    if(message.author.id !== message.guild.ownerID) 
      return message.reply("You're not the boss of me, you can't do that!");

    const user = message.mentions.users.first() || client.users.get(args[0]);
    if(!user) return message.reply("You must mention someone or give their ID!");

    const pointsToAdd = parseInt(args[1], 10);
    if(!pointsToAdd) 
      return message.reply("You didn't tell me how many points to give...")

    // Ensure there is a points entry for this user.
    client.points.ensure(`${message.guild.id}-${user.id}`, {
      user: message.author.id,
      guild: message.guild.id,
      points: 0,
      level: 1
    });

    // Get their current points.
    let userPoints = client.points.get(`${message.guild.id}-${user.id}`, "points");
    userPoints += pointsToAdd;


    // And we save it!
    client.points.set(`${message.guild.id}-${user.id}`, userPoints, "points")

    message.channel.send(`${user.tag} has received **${pointsToAdd}** points and now stands at **${userPoints}** points.`);
  }

  if(command === "cleanup") {
    // Let's clean up the database of all "old" users, 
    // and those who haven't been around for... say a month.

    // Get a filtered list (for this guild only).
    const filtered = client.points.filter( p => p.guild === message.guild.id );

    // We then filter it again (ok we could just do this one, but for clarity's sake...)
    // So we get only users that haven't been online for a month, or are no longer in the guild.
    const rightNow = new Date();
    const toRemove = filtered.filter(data => {
      return !message.guild.members.cache.has(data.user) || rightNow - 2592000000 > data.lastSeen;
    });

    toRemove.forEach(data => {
      client.points.delete(`${message.guild.id}-${data.user}`);
    });

    message.channel.send(`I've cleaned up ${toRemove.size} all levels.`);
  }
  
  if (command === "say") {
    const text = args.join(" ");
    if (!text)
      return message.channel
        .send("You have not specified something to say")
        .then(msg => {
          msg.delete({ timeout: 30000 });
        });
    message.channel.send(text);
  }
  
  if (command === "ip") {
    message.channel.send("Survival- de15.falix.gg:46916")
                                           
  }
  
  if (command === "mc-status") {
    message.channel.send("Server is currently up and playable please use the command '&ip' to check the ip. Thank you")
  }
  
});

client.once("ready" , () =>{
    console.log("I am online!")
});


           client.on('message', async message => {
              let args = message.content.substring(config.prefix.length).split(" ")
              if(message.member.permissions.has('MANAGE_MEMBERS')){
              if (message.content.startsWith(`${config.prefix}giveaway`)) {
                  let time = args[1]
                  if (!time) return message.channel.send('You did not specify a time!');
          
                  if (
                      !args[1].endsWith("d") &&
                      !args[1].endsWith("h") &&
                      !args[1].endsWith("m") &&
                      !args[1].endsWith("s") 
                  )
                      return message.channel.send('You need to use d (days), h (hours), m (minutes), or s (seconds)')
          
                      let gchannel = message.mentions.channels.first();
                      if (!gchannel) return message.channel.send("I can't find that channel in the server!")
          
                      let prize = args.slice(3).join(" ")
                      if (!prize) return message.channel.send('Arguement missing. What is the prize?')
          
                      message.delete()
                      gchannel.send(":tada: **NEW GIVEAWAY** :tada:")
                      let gembed = new Discord.MessageEmbed()
                          .setTitle("New Giveaway!")
                          .setDescription(`React with :tada: to enter the giveaway!\nHosted By: **${message.author}**\nTime: **${time}**\nPrize: **${prize}**`)
                          .setTimestamp(Date.now + ms(args[1]))
                          .setColor(3447003)
                      let n = await gchannel.send(gembed)
                      n.react("🎉")
                      setTimeout(() => {
                          if(n.reactions.cache.get("🎉").count <= 1) {
                              return message.channel.send("Not enough people for me to draw a winner!")
                          }
          
                          let winner = n.reactions.cache.get("🎉").users.cache.filter((u) => !u.bot).random();
                          gchannel.send(`Congratulations ${winner}! You just won the **${prize}**!`
                          );
                      }, ms(args[1]));
              }
            }
          })

const settings = new enmap({
    name: "settings",
    autoFetch: true,
    cloneLevel: "deep",
    fetchAll: true
});

client.on('ready', () => {
    console.log('ready')
});

client.on('message', async message => {
    if(message.author.bot) return;
    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if(command == "ticket-setup") {
        // ticket-setup #channel

        let channel = message.mentions.channels.first();
        if(!channel) return message.reply("Usage: `&ticket-setup #channel`");

        let sent = await channel.send(new Discord.MessageEmbed()
            .setTitle("Ticket System")
            .setDescription("React to open a ticket!")
            .setFooter("Ticket System")
            .setColor("00ff00")
        );

        sent.react('🎫');
        settings.set(`${message.guild.id}-ticket`, sent.id);

        message.channel.send("Ticket System Setup Done!")
    }

    if(command == "close") {
        if(!message.channel.name.includes("ticket-")) return message.channel.send("You cannot use that here!")
        message.channel.delete();
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if(user.partial) await user.fetch();
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();

    if(user.bot) return;

    let ticketid = await settings.get(`${reaction.message.guild.id}-ticket`);

    if(!ticketid) return;

    if(reaction.message.id == ticketid && reaction.emoji.name == '🎫') {
        reaction.users.remove(user);

        reaction.message.guild.channels.create(`ticket-${user.username}`, {
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: reaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                }
            ],
            type: 'text'
        }).then(async channel => {
            channel.send(`<@${user.id}>`, new Discord.MessageEmbed().setTitle("Welcome to your ticket!").setDescription("Please wait for 60mins for staff to come to your support").setColor("00ff00"))
        })
    }
});




//Log into discord using the token in config.json
client.login(config.token);