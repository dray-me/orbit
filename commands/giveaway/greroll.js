const Giveaway = require("../../data/Giveaway");

module.exports = {
  name: "greroll",
  description: "Reroll a giveaway",

  async execute(message, args) {
    const msgId = args[0];
    if (!msgId) return message.reply("Usage: `greroll <messageID>`");

    const gw = await Giveaway.findOne({ messageId: msgId, guildId: message.guild.id });
    if (!gw || !gw.ended) return message.reply("Giveaway not found or not ended.");

    const channel = message.guild.channels.cache.get(gw.channelId);
    if (!channel) return message.reply("Channel not found.");

    const msg = await channel.messages.fetch(gw.messageId).catch(() => null);
    if (!msg) return message.reply("Message not found.");

    const reaction = msg.reactions.cache.get("🎉");
    if (!reaction) return message.reply("No 🎉 reaction found.");

    const users = await reaction.users.fetch().catch(() => null);
    if (!users) return message.reply("No users found.");

    const participants = users.filter(u => !u.bot).map(u => u.id);
    if (!participants.length) return message.reply("No valid participants.");

    const winners = [];
    const used = new Set();

    while (winners.length < gw.winners && used.size < participants.length) {
      const winner = participants[Math.floor(Math.random() * participants.length)];
      if (!used.has(winner)) {
        winners.push(`<@${winner}>`);
        used.add(winner);
      }
    }

    message.channel.send(`🎉 New winner(s): ${winners.join(", ")}`);
  }
};