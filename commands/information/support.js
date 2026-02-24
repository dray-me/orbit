const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: "support",
    description: "Get the support server link",
    execute(message, args, client) {
        const supportLink = "https://discord.gg/5ZJ9TVNafR";

        // ✅ Embed Create Karo
        const embed = new EmbedBuilder()
            .setColor("#2b2d31") // Dark Discord color
            .setDescription("Click [Here](https://discord.gg/5ZJ9TVNafR) To Join Support Server!");

        // ✅ Button Create Karo
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Support Server")
                .setStyle(ButtonStyle.Link)
                .setURL(supportLink)
        );

        // ✅ Embed Send Karo
        message.channel.send({ embeds: [embed], components: [row] });
    }
};