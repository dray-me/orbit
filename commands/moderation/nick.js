const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nick',
    description: 'Change the nickname of a user',
    category: 'utility',
    usage: '<@user> <new nickname>',
    aliases: ['nickname'],
    execute: async (message, args) => {
        // User ke paas "Manage Members" permission honi chahiye
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply('❌ You need **Manage Nicknames** permission to use this command!');
        }

        // Bot ke paas "Administrator" aur "Manage Members" permission honi chahiye
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.Administrator) || 
            !message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            return message.reply('❌ I need **Administrator** and **Manage Nicknames** permissions to change nicknames!');
        }

        // Mentioned user check kare
        const target = message.mentions.members.first();
        if (!target) {
            return message.reply('Please mention a user whose nickname you want to change.');
        }

        // Naya nickname check kare
        const newNickname = args.slice(1).join(' ');
        if (!newNickname) {
            return message.reply('Please provide a new nickname.');
        }

        try {
            await target.setNickname(newNickname);
            message.reply(`✅ Successfully changed **${target.user.tag}**'s nickname to **${newNickname}**`);
        } catch (error) {
            console.error('Error changing nickname:', error);
            message.reply('❌ An error occurred while changing the nickname!');
        }
    }
};