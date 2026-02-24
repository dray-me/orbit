const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = { name: 'roleicon', description: 'Set a role icon if the server is eligible.', execute: async (client, message, args) => { if (!message.guild) return;

if (!message.member || !message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:cross:1354835259107180687> | You must have `Manage Roles` permissions to use this command.')
            ]
        });
    }

    if (message.guild.premiumTier < 2) {
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:cross:1354835259107180687> | Your server doesn\'t meet the **Roleicon** requirements. Servers with level **2** boosts are allowed to set role icons.')
            ]
        });
    }

    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    const icon = args[1];
    
    if (!role || !icon) {
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription('Use `roleicon @role <icon_url>` to set role icons.')
            ]
        });
    }

    if (!/^https?:\/\//.test(icon)) {
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:cross:1354835259107180687> | Please provide a valid image URL.')
            ]
        });
    }

    try {
        await role.setIcon(icon);
        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Green')
                    .setDescription(`<:tick:1354835257223807036> | Role Icon was set for ${role}.`)
            ]
        });
    } catch (error) {
        console.error(error);
        message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('Red')
                    .setDescription('<:cross:1354835259107180687> | Failed to set role icon. Ensure the bot has `Manage Roles` permission and the role is below the bot’s role.')
            ]
        });
    }
}

};