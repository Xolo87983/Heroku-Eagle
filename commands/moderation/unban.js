const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const { Color } = "#7289da"
module.exports = {
  name: "unban",
    category: "moderation",
    description: "unbans a banned user",
    usage: "[COMMAND] + [USER]",
  run: async (client, message, args) => {
    //Start
    message.delete();
    if (!message.member.hasPermission("BAN_MEMBERS"))
      return message.channel.send(
        `Sorry you dont have perms to use this command`
      );

    if (!args[0])
      return message.channel.send(
        `Please give me the member id you can to unban`
      );

    if (isNaN(args[0])) return message.channel.send(`Please Give Me Valid ID!`);

    if (args[0] === message.author.id)
      return message.channel.send(`Noob you are not banned`);

    if (args[0] === message.guild.owner.user.id)
      return message.channel.send(`Server owner cant be banned you idiot`);

    if (args[0] === client.user.id)
      return message.channel.send(`I am unbanned already`);

    let FetchBan = await message.guild.fetchBans();

    let Member;
    Member =
      FetchBan.find(
        b => b.user.username.toLowerCase() === args[0].toLocaleLowerCase()
      ) ||
      FetchBan.get(args[0]) ||
      FetchBan.find(
        bm => bm.user.tag.toLowerCase() === args[0].toLocaleLowerCase()
      );

    if (!Member)
      return message.channel.send(
        "Please provide me with a valid banned ip"
      );

    let Reason = args.slice(1).join(" ") || "No Reason Provided!";

    try {
      message.guild.members.unban(Member.user.id, Reason);
    } catch (error) {
      return message.channel.send(
        `I am unable to unban that user for some reason`
      );
    }

    let embed = new MessageEmbed()
      .setColor(Color)
      .setTitle(`Member unbanned!`)
      .addField(`Moderator`, `${message.author.tag} (${message.author.id}}`)
      .addField(`Unbanned member`, `${Member.user.tag} (${Member.user.id}`)
      .addField(`Reason`, `${Reason || "No Reason Provided!"}`)
      .setFooter(`Unbanned by ${message.author.username}`)
      .setTimestamp();

    return message.channel.send(embed);

    
  }
};
