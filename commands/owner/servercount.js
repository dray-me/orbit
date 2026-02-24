const { EmbedBuilder } = require('discord.js');
const { ownerID } = require('../../config.json'); // 🟢 Fetching ownerID from config.json

module.exports = {
    name: 'scount',
    description: 'Displays the bot\'s total server and user count (Owner only)',
    run: async (message, args, client) => {
        // ✅ Owner Check
        if (message.author.id !== ownerID) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ | This command is for the bot owner only.')
                ]
            });
        }

        // ✅ Get Stats
        const serverCount = client.guilds.cache.size;
        const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0); // Total users across all servers

        // ✅ Embed Response
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('HAHA')
            .setDescription(`**Servers**: ${serverCount} servers\n**Users**: ${userCount} users`)
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};