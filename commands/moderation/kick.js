const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'kick',
    aliases: ['k'],
    description: 'Kick a member from the server.',
    async execute(message, args) {
        // Permission check
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('<:cross:1354835259107180687> | You need the `Kick Members` permission to use this command.')
                ]
            });
        }

        // Member fetching
        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!user) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('<:cross:1354835259107180687> | Mention the user first')
                ]
            });
        }

        // Kickable check
        if (!user.kickable) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('<:cross:1354835259107180687> | I cannot kick this member due to role hierarchy or missing permissions.')
                ]
            });
        }

        // Reason
        const reason = args.slice(1).join(' ') || 'No reason provided';
        await user.kick(reason);

        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor('#00FF00')
                    .setDescription(`<:tick:1354835257223807036> | Successfully kicked **${user.user.tag}** from the server.\n**Reason:** ${reason}`)
            ]
        });
    }
};