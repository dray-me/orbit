const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require("discord.js");
const config = require("../../config.json");

module.exports = {
  name: "report",
  description: "Send a bug or suggestion report",
  execute: async (message, args, client) => {
    const reportChannel = client.channels.cache.get(config.reportChannelID);

    // Direct report using args
    if (args.length) {
      if (!reportChannel) return message.reply("Report channel not found.");

      const embed = new EmbedBuilder()
        .setAuthor({ name: "Stratos Bug Report", iconURL: client.user.displayAvatarURL() })
        .setTitle(`Reported by ${message.author.tag}`)
        .setDescription(args.join(" "))
        .setFooter({ text: `Report submitted ${new Date().toLocaleString()}`, iconURL: message.author.displayAvatarURL() });

      await reportChannel.send("<@1105408192537698334>");
      await reportChannel.send({ embeds: [embed] });

      return message.reply({
        embeds: [new EmbedBuilder().setColor("Green").setDescription("Your report has been submitted!")]
      });
    }

    // Dropdown UI
    const embed = new EmbedBuilder()
      .setAuthor({ name: "Stratos Bug Report", iconURL: client.user.displayAvatarURL() })
      .setDescription(`**Help improve Stratos by reporting any bugs or issues you encounter!**

**How to report:**  
• Select an option from the dropdown menu below  
• Fill in details about the issue you encountered  
• Submit the form to send your report

Alternatively, you can quickly report by typing:  
\`report [description of the bug]\``)
      .setFooter({
        text: `Requested by ${message.author.tag} | Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        iconURL: message.author.displayAvatarURL()
      });

    const select = new StringSelectMenuBuilder()
      .setCustomId("report-menu")
      .setPlaceholder("Choose a report category")
      .addOptions([
        {
          label: "Bug",
          value: "bug",
          emoji: "🐛"
        },
        {
          label: "Feature Request",
          value: "feature",
          emoji: "✨"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(select);

    const sentMessage = await message.channel.send({ embeds: [embed], components: [row] });

    // Disable dropdown after 10 minutes
    setTimeout(async () => {
      try {
        const disabledMenu = select.setDisabled(true);
        const disabledRow = new ActionRowBuilder().addComponents(disabledMenu);
        await sentMessage.edit({ components: [disabledRow] });
      } catch (err) {
        console.error("Failed to disable dropdown:", err);
      }
    }, 600000); // 10 minutes in milliseconds
  }
};