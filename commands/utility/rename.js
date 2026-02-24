const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rename',
    description: 'Rename the current channel',
    category: 'utility',
    usage: '<new name>',
    aliases: ['renamechannel'],
    execute: async (message, args) => {
        const noPermEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setDescription('<:cross:1354835259107180687> You need **Manage Channels** permission to use this command!');

        const botPermEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setDescription('<:cross:1354835259107180687> I need **Administrator** permission to rename the channel!');

        const noNameEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setDescription('<:cross:1354835259107180687> Please provide a new name for the channel!');

        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setDescription('<:cross:1354835259107180687> An error occurred while renaming the channel!');

        // Permission checks
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ embeds: [noPermEmbed] });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [botPermEmbed] });
        }

        if (!args.length) {
            return message.reply({ embeds: [noNameEmbed] });
        }

        const newName = args.join(' ');

        try {
            await message.channel.setName(newName);

            const successEmbed = new EmbedBuilder()
                .setColor(0x1F8B4C)
                .setDescription(`<:tick:1354835257223807036> Channel renamed to ${message.channel}`);

            message.reply({ embeds: [successEmbed] });
        } catch (error) {
            console.error('Error renaming channel:', error);
            message.reply({ embeds: [errorEmbed] });
        }
    }
};