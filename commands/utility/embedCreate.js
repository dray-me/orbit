const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  WebhookClient,
} = require("discord.js");

const cooldown = new Map();

module.exports = {
  name: "embed",
  description: "Create and send a custom embed.",
  category: "Utility",
  async execute(message, args, client) {
    const key = `${message.author.id}-${message.guild.id}`;

    if (!message.member.permissions.has("ManageMessages"))
      return message.reply("❌ You need `Manage Messages` permission.");
    if (!message.guild.members.me.permissions.has("EmbedLinks"))
      return message.reply("❌ I need `Embed Links` permission.");

    if (cooldown.has(key)) {
      return message.reply("📡 | You are currently in cooldown. Please try again later or abort your ongoing embed creation process.");
    }

    cooldown.set(key, true);
    setTimeout(() => cooldown.delete(key), 10 * 60 * 1000); // 10 min cooldown

    const embed = new EmbedBuilder()
      .setDescription("Default Embed Description")
      .setColor(0x2F3136);

    const promptEmbed = (desc) =>
      new EmbedBuilder().setDescription(desc).setColor("Blurple");

    const createDisabledButtons = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("disable").setLabel("Session Expired").setStyle(ButtonStyle.Secondary).setDisabled(true)
      );

    const mainButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("author_text").setLabel("Author Text").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("author_icon").setLabel("Author Icon").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("title").setLabel("Title").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("description").setLabel("Description").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("thumbnail").setLabel("Thumbnail").setStyle(ButtonStyle.Secondary)
    );

    const mainButtons2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("image").setLabel("Image").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("footer_text").setLabel("Footer Text").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("footer_icon").setLabel("Footer Icon").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("color").setLabel("Color").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("reset").setLabel("Reset Embed").setStyle(ButtonStyle.Danger)
    );

    const sendButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("channel").setLabel("Channel To Send").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("webhook").setLabel("Webhook").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("abort").setLabel("Abort").setStyle(ButtonStyle.Danger)
    );

    const msg = await message.channel.send({
      content: "🛠️ Improve the Embed",
      embeds: [embed],
      components: [mainButtons, mainButtons2, sendButtons],
    });

    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 10 * 60 * 1000, // 10 minutes
    });

    collector.on("collect", async (interaction) => {
      await interaction.deferUpdate();
      const input = async (prompt) => {
        await interaction.followUp({ embeds: [promptEmbed(prompt)], ephemeral: true });
        const collected = await message.channel.awaitMessages({
          filter: (m) => m.author.id === message.author.id,
          max: 1,
          time: 30000,
        });
        return collected.first()?.content;
      };

      const isImageURL = (url) => /\.(jpeg|jpg|png|gif)$/i.test(url);

      switch (interaction.customId) {
        case "author_text": {
          const text = await input("Embed Author Limit is 256 Characters. Provide Author Text:");
          if (text && text.length <= 256) embed.setAuthor({ name: text });
          msg.edit({ embeds: [embed] });
          break;
        }

        case "author_icon": {
          const url = await input("Provide a valid image URL for Author Icon (.jpg/.jpeg/.png/.gif) or type `reset`:");
          if (url === "reset") {
            if (embed.data.author) delete embed.data.author.icon_url;
          } else if (isImageURL(url)) {
            if (!embed.data.author) embed.setAuthor({ name: "\u200B" });
            embed.data.author.icon_url = url;
          }
          msg.edit({ embeds: [embed] });
          break;
        }

        case "title": {
          const text = await input("Embed Title Limit is 256 Characters. Provide a Title:");
          if (text && text.length <= 256) embed.setTitle(text);
          msg.edit({ embeds: [embed] });
          break;
        }

        case "description": {
          const text = await input("Embed Description Limit is 4096 Characters. Provide a Description:");
          if (text && text.length <= 4096) embed.setDescription(text);
          msg.edit({ embeds: [embed] });
          break;
        }

        case "thumbnail": {
          const url = await input("Provide a valid image URL for Thumbnail (.jpg/.jpeg/.png/.gif) or type `reset`:");
          if (url === "reset") embed.setThumbnail(null);
          else if (isImageURL(url)) embed.setThumbnail(url);
          msg.edit({ embeds: [embed] });
          break;
        }

        case "image": {
          const url = await input("Provide a valid image URL (.jpg/.jpeg/.png/.gif) or type `reset`:");
          if (url === "reset") embed.setImage(null);
          else if (isImageURL(url)) embed.setImage(url);
          msg.edit({ embeds: [embed] });
          break;
        }

        case "footer_text": {
          const text = await input("Embed Footer Limit is 256 Characters. Provide a Footer Text:");
          if (text && text.length <= 256) embed.setFooter({ text });
          msg.edit({ embeds: [embed] });
          break;
        }

        case "footer_icon": {
          const url = await input("Provide a valid image URL for Footer Icon (.jpg/.jpeg/.png/.gif) or type `reset`:");
          if (url === "reset") {
            if (embed.data.footer) delete embed.data.footer.icon_url;
          } else if (isImageURL(url)) {
            if (!embed.data.footer) embed.setFooter({ text: "\u200B" });
            embed.data.footer.icon_url = url;
          }
          msg.edit({ embeds: [embed] });
          break;
        }

        case "color": {
          const color = await input("Provide a Color in hex code format (e.g., `#00FFFF`):");
          if (/^#?[0-9A-F]{6}$/i.test(color)) {
            embed.setColor(color.startsWith("#") ? color : `#${color}`);
            msg.edit({ embeds: [embed] });
          } else {
            interaction.followUp({ content: "❌ Invalid color format.", ephemeral: true });
          }
          break;
        }

        case "reset":
          embed.setAuthor(null).setTitle(null).setDescription("Default Embed Description").setColor(0x2F3136).setThumbnail(null).setImage(null).setFooter(null);
          msg.edit({ embeds: [embed] });
          break;

        case "channel": {
          const id = await input("📌 Provide the **Channel ID** to send the embed:");
          const ch = message.guild.channels.cache.get(id);
          if (!ch || ch.type !== ChannelType.GuildText)
            return interaction.followUp({ content: "❌ Invalid channel.", ephemeral: true });
          ch.send({ embeds: [embed] }).catch(() => {});
          interaction.followUp({ content: "✅ Embed sent!", ephemeral: true });
          break;
        }

        case "webhook": {
          const url = await input("🔗 Provide a **Webhook URL** to send the embed:");
          try {
            const wh = new WebhookClient({ url });
            await wh.send({ embeds: [embed] });
            interaction.followUp({ content: "✅ Embed sent via Webhook!", ephemeral: true });
          } catch {
            interaction.followUp({ content: "❌ Invalid webhook URL.", ephemeral: true });
          }
          break;
        }

        case "abort":
          await msg.delete().catch(() => {});
          cooldown.delete(key);
          await message.reply("🚫 Embed creation aborted.");
          collector.stop();
          break;
      }
    });

    collector.on("end", () => {
      cooldown.delete(key);
      msg.edit({ components: [createDisabledButtons()] }).catch(() => {});
    });
  },
};