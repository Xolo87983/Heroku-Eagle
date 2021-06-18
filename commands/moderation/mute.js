
const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const { Color } = "#7289da"

module.exports = {
  name: "mute",
    category: "moderation",
    description: "mutes a mentioned user",
    usage: "[COMMAND] + [USER]",
  run: async (client, message, args) => {
    //Commands
    message.delete();
    if (!message.member.hasPermission("KICK_MEMBERS"))
      return message.channel.send(
        `Sorry looks like you dont have perms to use this command`
      );

    let Member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    if (!Member) return message.channel.send(`Please Mention A User!`);

    let Role = message.guild.roles.cache.find(role => role.name === "Muted").id;

    if (!Role)
      return message.channel.send(
        `Please Create Mute Role | Role Name : Muted`
      );

    if (Member.roles.cache.has(Role)) {
      return message.channel.send(`Mentioned user is already muted`);
    }

    let Reason = args.slice(1).join(" ");

    let Embed = new MessageEmbed()
      .setColor(Color)
      .setTitle(`Member has been muted!`)
      .addField(`Moderator`, `${message.author.tag} (${message.author.id}`)
      .addField(`Muted member`, `${Member.user.tag} (${Member.user.id})`)
      .addField(`Reason`, `${Reason || "No reason was provided"}`)
      .setFooter(`Muted by ${message.author.username}`)
      .setTimestamp();

    if (Role && !Member.roles.cache.has(Role)) {
      Member.roles.add([Role]);
      return message.channel.send(Embed);
    } else {
      return message.channel.send(`Error occured try again later`);
    }

    
  }
};
