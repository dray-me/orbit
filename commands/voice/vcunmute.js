const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'vcunmute',
    description: 'Unmute a user in voice channels',
    permissions: [PermissionsBitField.Flags.MuteMembers],
    usage: '<@user> [reason]',
    category: 'Moderation',
    async execute(message, args) {
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('**<:cross:1354835259107180687> | You must mention a user to voice unmute!**')
                ]
            });
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        try {
            // Force fetch fresh member data with voice state
            const member = await message.guild.members.fetch({
                user: user.id,
                force: true,
                withPresences: true
            });

            if (!member) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('**<:cross:1354835259107180687> | That user is not in this server!**')
                    ]
                });
            }

            // Case 1: User not in any voice channel
            if (!member.voice.channel) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FFA500')
                            .setDescription(`**<:nothing:1356629211129053304> | <@${user.id}> is not in any voice channel!**`)
                    ]
                });
            }

            // Case 2: Attempt to unmute regardless of current state
            try {
                await member.voice.setMute(false, reason);
                
                // Verify unmute was successful
                const refreshedMember = await message.guild.members.fetch(user.id, { force: true });
                
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#00FF00')
                            .setDescription(`**<:tick:1354835257223807036> | Successfully UnMuted <@${user.id}> from voice!**`)
                            .setFooter({ 
                                text: `Moderator: ${message.author.tag}`,
                                iconURL: message.author.displayAvatarURL()
                            })
                            .setTimestamp()
                    ]
                });
                
            } catch (unmuteError) {
                console.error('Unmute attempt failed:', unmuteError);
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FFA500')
                            .setDescription(`**<:nothing:1356629211129053304> | <@${user.id}> is not server muted or unmute failed!**`)
                    ]
                });
            }
            
        } catch (error) {
            console.error('Voice Unmute Error:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription(`**<:cross:1354835259107180687> | Failed to process unmute command!**`)
                ]
            });
        }
    }
};