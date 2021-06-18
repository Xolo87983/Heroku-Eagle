const { chatBot } = require('reconlx') 

module.exports = {
    name : 'chat',
  category: "utility",
    description: "Chat with the bot",
    usage: "[command | user] or [command]",
    run : async(client, message, args) => {
        chatBot(message, args.join(" "))
    }
}