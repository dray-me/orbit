const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'vcmuteall',
    category: 'voice',
    run: async (client, message, args) => {
        if (!message || !message.channel || !message.member || !message.guild) return;

        if (!message.member.permissions.has('MUTE_MEMBERS')) {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FF0000')
                        .setDescription(`You must have \`Mute Members\` permission to use this command.`)
                ]
            });
        }

        if (!message.guild.me.permissions.has('MUTE_MEMBERS')) {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FF0000')
                        .setDescription(`I must have \`Mute Members\` permission to use this command.`)
                ]
            });
        }

        if (!message.member.voice.channel) {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FFA500')
                        .setDescription(`You must be connected to a voice channel first.`)
                ]
            });
        }

        try {
            let i = 0;
            const voiceChannel = message.member.voice.channel;
            for (const [_, member] of voiceChannel.members) {
                if (!member.voice.serverMute) {
                    await member.voice.setMute(true, `${message.author.tag} | ${message.author.id}`);
                    i++;
                }
            }

            message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#00FF00')
                        .setDescription(`✅ | Successfully muted **${i}** members in **${voiceChannel.name}**.`)
                ]
            });
        } catch (err) {
            console.error("VCMuteAll Error:", err);
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FF0000')
                        .setDescription(`I don't have the required permissions to mute members.`)
                ]
            });
        }
    }
};