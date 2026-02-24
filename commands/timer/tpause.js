const {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  MessageFlags
} = require("discord.js");
const Timer = require("../../data/Timer");

module.exports = {
  name: "tpause",
  description: "Pause a running timer",

  async execute(message, args, client) {
    const msgId = args[0];
    if (!msgId) return message.reply("⚠️ Provide the timer message ID to pause.");

    const data = await Timer.findOne({ messageId: msgId, guildId: message.guild.id });
    if (!data) return message.reply("❌ Timer not found.");
    if (data.paused) return message.reply("⏸️ Timer is already paused.");

    // calculate remaining time
    const remaining = data.endTime - Date.now();
    data.remaining = remaining;
    data.paused = true;
    await data.save();

    // fetch old message
    const channel = await client.channels.fetch(data.channelId);
    const msg = await channel.messages.fetch(data.messageId);

    // rebuild container with pause info
    const container = new ContainerBuilder();

    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`⏸️ **Timer Paused**`),
          new TextDisplayBuilder().setContent(`Timer paused at: ${new Date().toLocaleString()}`),
          new TextDisplayBuilder().setContent(`⏱️ Remaining: ${(remaining / 1000).toFixed(0)}s`)
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(client.user.displayAvatarURL({ size: 1024 }))
        )
    );

    // update original timer message
    await msg.edit({
      components: [container],
      flags: MessageFlags.IsComponentsV2
    });

    return message.reply("✅ Timer paused.");
  },
};