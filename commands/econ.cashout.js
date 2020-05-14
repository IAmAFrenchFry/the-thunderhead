const Discord = require("discord.js");
const fs = require("graceful-fs");
var eco = require('discord-economy');
const alpha = require('alphavantage')({ key: `cirrus-${Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)}` });
const config = require("../static/config.json"); 
const shares = require("../dynamic/shares.json");
module.exports.run = async (client, message, args) => {
  let requiredPermission = "USE_EXTERNAL_EMOJIS"; 
  if (!message.member.hasPermission(requiredPermission)) return message.channel.send(client.msg["rejected_user_permission_"+requiredPermission]);
  if (!message.guild.me.hasPermission(requiredPermission)) return message.channel.send(client.msg["rejected_client_permission_"+requiredPermission]);

 
  if (!args[0]) return message.channel.send(client.msg["cashout_stock_invalid"]);
    if (args[1] < 1 || Math.floor(args[1] != args[1])) return message.channel.send(client.msg["cashout_invalid"]);
    if (!shares[message.author.id][args[0].toUpperCase()]) return message.channel.send(client.msg["cashout_invalid"]); // If no shares then just end the check o_0
    if (!args[1]) return message.channel.send(client.msg["cashout_invalid"]);
    if (shares[message.author.id][args[0].toUpperCase()] < args[1]) return message.channel.send(client.msg["cashout_amount_invalid"]);
    alpha.data.intraday(config.stocks[args[0].toUpperCase()][1]).then(data => {
        let stockPrice = (parseInt(data["Time Series (1min)"][Object.keys(data["Time Series (1min)"])[0]]["4. close"]));
        shares[message.author.id][args[0].toUpperCase()] -= parseInt(args[1])
        eco.AddToBalance(message.author.id, stockPrice * args[1])
        message.channel.send(`Shares sold for ${stockPrice * args[1]} ${client.emotes["currency_vibes"]}. You now have ${shares[message.author.id][args[0].toUpperCase()]} shares in ${args[0].toUpperCase()}.`)
        const channel = client.channels.cache.get(config["econ_log_id"]);
        channel.send(`Shares sold for ${stockPrice * args[1]} ${client.emotes["currency_vibes"]}. ${message.author.username} (${message.author.id}) now has ${shares[message.author.id][args[0].toUpperCase()]} shares in ${args[0].toUpperCase()}.`)
    })
} 

module.exports.config = {
  name: "cashout",
  aliases: ["uninvest", "cashout"],
  use: "cashout [Company] [Amount]",
  description: "Invest in a company and hope their stock price goes up.",
  state : "gamma",
  page: 2
};