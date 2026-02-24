const {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
  MessageFlags
} = require("discord.js");
const Timer = require("../../data/Timer");

module.exports = {
  name: "tresume",
  description: "Resume a paused timer",

  async execute(message, args, client) {
    const msgId = args[0];
    if (!msgId) return message.reply("⚠️ Provide the timer message ID to resume.");

    const data = await Timer.findOne({ messageId: msgId, guildId: message.guild.id });
    if (!data) return message.reply("❌ Timer not found.");
    if (!data.paused) return message.reply("▶️ Timer is already running.");

    // calculate new end time
    const newEnd = Date.now() + data.remaining;
    data.endTime = newEnd;
    data.paused = false;
    await data.save();

    // fetch old message
    const channel = await client.channels.fetch(data.channelId);
    const msg = await channel.messages.fetch(data.messageId);

    // build container with resumed info
    const container = new ContainerBuilder();

    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`▶️ **Timer Resumed**`),
          new TextDisplayBuilder().setContent(
            `📡 Ends: <t:${Math.floor(newEnd / 1000)}:R> (<t:${Math.floor(newEnd / 1000)}:f>)`
          ),
          new TextDisplayBuilder().setContent(`Resumed at: ${new Date().toLocaleString()}`)
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

    return message.reply("✅ Timer resumed.");
  },
};