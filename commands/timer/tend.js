const {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  MessageFlags
} = require("discord.js");
const Timer = require("../../data/Timer");

module.exports = {
  name: "tend",
  description: "End and remove a timer",

  async execute(message, args, client) {
    const msgId = args[0];
    if (!msgId) return message.reply("⚠️ Provide the timer message ID to end.");

    const data = await Timer.findOneAndDelete({ messageId: msgId, guildId: message.guild.id });
    if (!data) return message.reply("❌ Timer not found.");

    const channel = await client.channels.fetch(data.channelId);
    const msg = await channel.messages.fetch(data.messageId);

    // Build replacement container
    const container = new ContainerBuilder();

    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`⛔ **Timer Ended**`),
          new TextDisplayBuilder().setContent(`Ended at | ${new Date().toLocaleString()}`)
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(client.user.displayAvatarURL({ size: 1024 }))
        )
    );

    // Edit original timer message
    await msg.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    return message.reply("✅ Timer ended and removed.");
  },
};