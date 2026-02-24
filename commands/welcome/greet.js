const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../data/welcomeConfig.json");

module.exports = {
  name: "welcome",
  description: "Manage the welcome system",
  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply("❌ You don't have permission to use this command.");
    }

    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}));
    const config = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const guildId = message.guild.id;
    const sub = args[0]?.toLowerCase();

    if (!sub) return message.reply("❌ Usage: `welcome <set/message/view/reset>`");

    switch (sub) {
      case "set": {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply("❌ Please mention a valid channel.");
        config[guildId] = config[guildId] || {};
        config[guildId].channel = channel.id;
        fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
        return message.channel.send(`✅ Welcome channel set to <#${channel.id}>.`);
      }

      case "message": {
        config[guildId] = config[guildId] || {};
        const data = config[guildId].embed || {};
        const embed = buildEmbed(message, data);

        const row1 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("title").setLabel("Title").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("description").setLabel("Description").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("footer").setLabel("Footer").setStyle(ButtonStyle.Secondary)
        );

        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("image").setLabel("Image").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("color").setLabel("Color").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("done").setLabel("Save & Exit").setStyle(ButtonStyle.Success)
        );

        const msg = await message.channel.send({
          content: "🎨 Customize your welcome embed below. Use `{user}`, `{server}`, `{memberCount}`.",
          embeds: [embed],
          components: [row1, row2],
        });

        const collector = msg.createMessageComponentCollector({ time: 120000 });

        collector.on("collect", async (i) => {
          if (i.user.id !== message.author.id)
            return i.reply({ content: "❌ You're not allowed to use this.", ephemeral: true });

          const field = i.customId;
          if (field === "done") {
            config[guildId].embed = data;
            fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
            await i.update({ content: "✅ Welcome embed saved successfully.", components: [], embeds: [] });
            collector.stop();
            return;
          }

          const prompts = {
            title: "📌 Send the new **title** for the welcome embed.",
            description: "📝 Send the new **description** (you can use `{user}`, `{server}`, `{memberCount}`).",
            footer: "🔻 Send the new **footer text**.",
            image: "🖼️ Send the **image URL** (must be a direct link).",
            color: "🎨 Send the **hex color code** (e.g., `#2b2d31`).",
          };

          await i.reply({ content: prompts[field], ephemeral: true });

          const filter = (m) => m.author.id === message.author.id;
          const collected = await message.channel.awaitMessages({
            filter,
            max: 1,
            time: 30000,
          }).catch(() => null);

          const userMsg = collected?.first();
          if (!userMsg) {
            return i.followUp({ content: "❌ No input received. Try again.", ephemeral: true });
          }

          const input = userMsg.content.trim();
          if (field === "color") {
            if (!/^#?[0-9A-Fa-f]{6}$/.test(input)) {
              return i.followUp({ content: "❌ Invalid hex color. Use something like `#ff0000`.", ephemeral: true });
            }
            data.color = input.startsWith("#") ? input : `#${input}`;
          } else {
            data[field] = input;
          }

          await userMsg.delete().catch(() => {});
          const updatedEmbed = buildEmbed(message, data);
          await msg.edit({ embeds: [updatedEmbed] });
        });

        collector.on("end", async () => {
          if (msg.editable) {
            await msg.edit({ components: [] }).catch(() => {});
          }
        });

        return;
      }

      case "view": {
        const data = config[guildId];
        if (!data) return message.reply("❌ Welcome system is not configured.");
        const ch = data.channel ? `<#${data.channel}>` : "Not set";
        const embedData = data.embed || {};
        const previewEmbed = buildEmbed(message, embedData);
        return message.channel.send({
          content: `📋 **Welcome Settings:**\n**Channel:** ${ch}`,
          embeds: [previewEmbed],
        });
      }

      case "reset": {
        delete config[guildId];
        fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
        return message.channel.send("♻️ Welcome configuration reset.");
      }

      default:
        return message.reply("❌ Invalid subcommand. Use `set`, `message`, `view`, or `reset`.");
    }
  },
};

function buildEmbed(message, data) {
  const variables = {
    "{user}": `<@${message.author.id}>`,
    "{server}": message.guild.name,
    "{memberCount}": message.guild.memberCount.toString(),
  };

  const resolveVars = (text) => {
    if (!text) return null;
    return text
      .replace(/{user}/gi, variables["{user}"])
      .replace(/{server}/gi, variables["{server}"])
      .replace(/{memberCount}/gi, variables["{memberCount}"]);
  };

  const embed = new EmbedBuilder().setColor(data.color || "#2b2d31");

  if (data.title) embed.setTitle(resolveVars(data.title));
  if (data.description) embed.setDescription(resolveVars(data.description));
  if (data.footer) embed.setFooter({ text: resolveVars(data.footer) });
  if (data.image) embed.setImage(data.image);

  return embed;
}
