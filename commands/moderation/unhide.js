const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unhide',
    description: 'Unhides the current channel for @everyone',
    run: async (message, args, client) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ You need `Manage Channels` permission to use this command.');
        }

        await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            ViewChannel: true
        });

        const unhideEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`🔓 This channel is now visible for @everyone.`)
            .setTimestamp();

        message.channel.send({ embeds: [unhideEmbed] });
    }
};