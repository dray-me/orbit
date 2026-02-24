const { EmbedBuilder } = require("discord.js");
const Ignore = require("../../data/Ignore");

module.exports = {
  name: "ignore",
  description: "Manage ignored channels and bypass roles",
  async execute(message, args) {
    if (!message.member.permissions.has("ManageChannels"))
      return message.reply("You don't have permission to use this command.");

    const [type, action] = args;
    const channel = message.mentions.channels.first();
    const role = message.mentions.roles.first();

    let data = await Ignore.findOne({ guildId: message.guild.id });
    if (!data) {
      data = new Ignore({
        guildId: message.guild.id,
        ignoredChannels: [],
        bypassRoles: [],
      });
      await data.save();
    }

    const embed = new EmbedBuilder().setColor("Blurple");

    if (!type) {
      embed.setTitle("Ignore Command Help").setDescription(`
\`\`\`
ignore channel add <channel>
ignore channel remove <channel>
ignore channel list
ignore channel reset
ignore bypass add <role>
ignore bypass remove <role>
ignore bypass list
ignore bypass reset
\`\`\`
Use these commands to manage ignored channels and bypass roles.
      `);
      return message.channel.send({ embeds: [embed] });
    }

    if (type === "channel") {
      switch (action) {
        case "add":
          if (!channel) return message.reply("Mention a channel to ignore.");
          if (data.ignoredChannels.includes(channel.id))
            return message.reply("This channel is already ignored.");
          data.ignoredChannels.push(channel.id);
          await data.save();
          embed.setDescription(`✅ Channel <#${channel.id}> added to ignore list.`);
          break;

        case "remove":
          if (!channel) return message.reply("Mention a channel to remove.");
          if (!data.ignoredChannels.includes(channel.id))
            return message.reply("This channel is not in the ignore list.");
          data.ignoredChannels = data.ignoredChannels.filter(id => id !== channel.id);
          await data.save();
          embed.setDescription(`✅ Channel <#${channel.id}> removed from ignore list.`);
          break;

        case "list":
          if (!data.ignoredChannels.length)
            return message.reply("No ignored channels.");
          embed.setTitle("Ignored Channels")
            .setDescription(data.ignoredChannels.map(id => `<#${id}>`).join("\n"));
          break;

        case "reset":
          data.ignoredChannels = [];
          await data.save();
          embed.setDescription("✅ Ignore list reset.");
          break;

        default:
          return message.reply("Use: `ignore channel add/remove/list/reset`");
      }
      return message.channel.send({ embeds: [embed] });
    }

    if (type === "bypass") {
      switch (action) {
        case "add":
          if (!role) return message.reply("Mention a role to bypass ignore.");
          if (data.bypassRoles.includes(role.id))
            return message.reply("This role is already in the bypass list.");
          data.bypassRoles.push(role.id);
          await data.save();
          embed.setDescription(`✅ Role <@&${role.id}> added to bypass list.`);
          break;

        case "remove":
          if (!role) return message.reply("Mention a role to remove.");
          if (!data.bypassRoles.includes(role.id))
            return message.reply("This role is not in the bypass list.");
          data.bypassRoles = data.bypassRoles.filter(id => id !== role.id);
          await data.save();
          embed.setDescription(`✅ Role <@&${role.id}> removed from bypass list.`);
          break;

        case "list":
          if (!data.bypassRoles.length)
            return message.reply("No bypass roles configured.");
          embed.setTitle("Bypass Roles")
            .setDescription(data.bypassRoles.map(id => `<@&${id}>`).join("\n"));
          break;

        case "reset":
          data.bypassRoles = [];
          await data.save();
          embed.setDescription("✅ Bypass list reset.");
          break;

        default:
          return message.reply("Use: `ignore bypass add/remove/list/reset`");
      }
      return message.channel.send({ embeds: [embed] });
    }

    return message.reply("Invalid usage. Use `ignore channel` or `ignore bypass`");
  }
};