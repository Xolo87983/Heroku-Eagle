const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const { Color } = "#7289da"

module.exports = {
  name: "unmute",
    category: "moderation",
    description: "unmutes a muted user",
    usage: "[COMMAND] + [USER]",
  run: async (client, message, args) => {
    //Start
    message.delete();
    if (!message.member.hasPermission("KICK_MEMBERS"))
      return message.channel.send(
        `Sorry looks like you dont have perms to use this command`
      );

    let Member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]);

    if (!Member) return message.channel.send(`Please mention an user`);

    let Role = message.guild.roles.cache.find(role => role.name === "Muted").id;

    if (!Role)
      return message.channel.send(
        `Mute role has been removed so member is no longer muted`
      );

    if (!Member.roles.cache.has(Role)) {
      return message.channel.send(`Member is unmuted already`);
    }

    let Embed = new MessageEmbed()
      .setColor(Color)
      .setTitle(`Member unmuted!`)
      .addField(`Moderator`, `${message.author.tag} (${message.author.id}`)
      .addField(`Unmuted member`, `${Member.user.tag} (${Member.user.id})`)
      .setFooter(`Unmuted by ${message.author.username}`)
      .setTimestamp();

    if (Role && Member.roles.cache.has(Role)) {
      Member.roles.remove([Role]);
      return message.channel.send(Embed);
    } else {
      return message.channel.send(`An error occured please inform the bot creater or try again later`);
    }

    //End
  }
};