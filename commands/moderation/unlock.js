const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unlock',
    description: 'Unlocks the current channel',
    run: async (message, args, client) => {
        // Check if user has the required permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ You need `Manage Channels` permission to use this command.');
        }

        // Check if the bot has permission
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ I need `Manage Channels` permission to unlock this channel.');
        }

        try {
            // Unlock the channel for @everyone
            await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: true
            });

            // Send embed confirmation
            const unlockEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`🔓 This channel has been unlocked for @everyone.`)
                .setTimestamp();

            message.channel.send({ embeds: [unlockEmbed] });
        } catch (error) {
            console.error('Error unlocking channel:', error);
            message.reply('❌ An error occurred while unlocking the channel.');
        }
    }
};