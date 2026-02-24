const Giveaway = require("../../data/Giveaway");

module.exports = {
  name: "glist",
  description: "Show active giveaways in this server",

  async execute(message) {
    const giveaways = await Giveaway.find({ guildId: message.guild.id, ended: false });

    if (!giveaways.length) return message.reply("No active giveaways in this server.");

    const list = giveaways
      .map((g, i) => `${i + 1}. **${g.prize}** | Ends <t:${Math.floor(g.endTime / 1000)}:R> | [Jump](https://discord.com/channels/${g.guildId}/${g.channelId}/${g.messageId})`)
      .join("\n");

    message.channel.send(`🎉 **Active Giveaways:**\n${list}`);
  }
};