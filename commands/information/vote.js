const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'vote',
    description: 'Vote for Stratos on Top.gg',
    async execute(message, args) {
        // Create the embed (simpler title like the second screenshot)
        const embed = new EmbedBuilder()
            .setTitle('Support Stratos!')  // Clean title without link
            .setDescription('Vote for **[Stratos!](https://discord.gg/S6AjkyQKNZ)** on Top.gg to help us grow! Your support is appreciated.')
            .setColor(0x0099FF); // Blue color - change as needed

        // Create the button with invite link
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Vote Stratos') // Button text
                    .setURL('https://top.gg/bot/1294987004483862528/vote') // Your Discord invite
                    .setStyle(ButtonStyle.Link) // Makes it a clickable link button
            );

        // Send the message
        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
};