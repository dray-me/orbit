const { EmbedBuilder } = require('discord.js');
const { ownerID } = require('../../config.json');

module.exports = {
    name: 'restart',
    aliases: ['reboot', 'rsbot'],
    description: 'Restarts the bot.',

    run: async (message, args, client) => {
        // **✅ Owner Check**
        if (message.author.id !== ownerID) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ | You are not authorized to use this command.')
                ]
            });
        }

        // **🔄 Processing Embed**
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setDescription('<a:loading:957459122519941171> | **Restarting the bot, please wait...**');

        const msg = await message.channel.send({ embeds: [embed] });

        // **⏳ Wait 3 seconds before restarting**
        setTimeout(() => {
            embed.setColor('#00FF00').setDescription('<:tick:1180470648053702657> | **Bot is restarting...**');
            msg.edit({ embeds: [embed] });

            console.log('🔄 Restarting bot...');
            process.exit(); // **Closes the bot process (Requires a process manager like PM2 or systemd to auto-restart)**
        }, 3000);
    }
};