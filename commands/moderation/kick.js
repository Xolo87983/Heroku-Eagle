const Discord = require("discord.js");
const { MessageEmbed } = require("discord.js");
const { Color } = "#7289da"

module.exports = {
 name: "kick",
    category: "moderation",
    description: "kicks a mentioned user",
    usage: "[COMMAND] + [USER]",
  run: async (client, message, args) => {
    //Command
    message.delete();
    if (!message.member.hasPermission("KICK_MEMBERS"))
      return message.channel.send(
        `Sorry looks like you dont have perms to use this command`
      );

    let Member = message.mentions.users.first();

    if (!Member)
      return message.channel.send(
        `Please mention an user`
      );

    if (!message.guild.members.cache.get(Member.id))
      return message.channel.send(`Please mention a valid member of the server`);

    if (Member.id === message.author.id)
      return message.channel.send(`You cant kick yourself`);

    if (Member.id === client.user.id)
      return message.channel.send(`Sorry but you cant kick me`);

    if (Member.id === message.guild.owner.user.id)
      return message.channel.send(`Eh idiot! you cant kick the server owner`);

    let Reason = args.slice(1).join(" ");

    let User = message.guild.member(Member);

    if (!User.kickable)
      return message.channel.send(`Sorry cant kick that member`);

    try {
      console.log(`Member Is Going To Get Kick!`);

      setTimeout(function() {
        User.kick({ reason: `${Reason || "No reason was provided"}` });
      }, 2000);
      let embed = new Discord.MessageEmbed()
        .setColor(Color)
        .setTitle(`Member Kicked!`)
        .addField(`Moderator`, `${message.author.tag} (${message.author.id}`)
        .addField(`Kicked Member`, `${Member.tag} (${Member.id})`)
        .addField(`Reason`, `${Reason || "No reason was provided"}`)
        .setFooter(`Requested by ${message.author.username}`)
        .setTimestamp();
      if (User && Member.bot === false)
        Member.send(
          `You Have Been Kicked From **${message.guild.name}** For ${Reason ||
            "No reason was provided"}`
        );
      message.channel.send(embed);
      console.log(
        `User: ${Member.tag} (${Member.id}) Just Got Kicked From ${
          message.guild.name
        } For ${Reason || "No reason was provided"}`
      );
    } catch (error) {
      return message.channel
        .send(
          `Sorry cant kick that member as my role is lower than his/her role`
        )
        .then(() => console.log(error));
    }

    
  }
};
		
    