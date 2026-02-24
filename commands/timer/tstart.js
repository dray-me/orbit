const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags
} = require("discord.js");
const ms = require("ms");
const Timer = require("../../data/Timer");

module.exports = {
  name: "tstart",
  description: "Start a timer",

  async execute(message, args, client) {
    const time = args[0];
    const userMessage = args.slice(1).join(" ");

    if (!time || !userMessage) {
      return message.reply(
        "⚠️ Usage: `?tstart <time in s|m|h|d> <message>`\nExample: `?tstart 1m Test`"
      );
    }

    const duration = ms(time);
    if (!duration || duration < 1000) return message.reply("❌ Invalid time format.");

    const endTime = Date.now() + duration;

    const container = new ContainerBuilder();

    // Header line (like your mention event)
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`⏳ Timer Started: **${userMessage}**`)
    );

    // Separator (placed exactly like your event code)
    container.addSeparatorComponents(new SeparatorBuilder());

    // Section with timer details
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `📡 Ends: <t:${Math.floor(endTime / 1000)}:R> (<t:${Math.floor(
              endTime / 1000
            )}:f>)`
          ),
          new TextDisplayBuilder().setContent(
            `Requested by: ${message.author.username}`
          ),
          new TextDisplayBuilder().setContent(
            `Timer ends | ${new Date(endTime).toLocaleString()}`
          )
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(
            message.author.displayAvatarURL({ size: 1024 })
          )
        )
    );

    // Send Components V2 style message
    const sent = await message.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    // Save in DB
    await Timer.create({
      guildId: message.guild.id,
      messageId: sent.id,
      channelId: sent.channel.id,
      endTime,
      userMessage,
    });
  },
};