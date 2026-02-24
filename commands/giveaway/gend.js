const Giveaway = require("../../data/Giveaway");

module.exports = {
  name: "gend",
  description: "End a giveaway early",

  async execute(message, args) {
    const msgId = args[0];
    if (!msgId) return message.reply("Usage: `gend <messageID>`");

    const gw = await Giveaway.findOne({ messageId: msgId, guildId: message.guild.id });
    if (!gw) return message.reply("Giveaway not found!");
    if (gw.ended) return message.reply("This giveaway has already ended.");

    gw.endTime = Date.now(); // end immediately
    await gw.save();

    message.reply(`✅ Giveaway for **${gw.prize}** will end shortly.`);
  }
};