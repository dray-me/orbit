const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'poll',
    description: 'Create a simple poll with reactions',
    category: 'utility',
    usage: '<question>',
    aliases: ['vote'],
    execute: async (message, args) => {
        // User ke paas "Manage Messages" permission honi chahiye
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('❌ You need **Manage Messages** permission to create a poll!');
        }

        // Bot ke paas "Send Messages" aur "Add Reactions" permissions honi chahiye
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.SendMessages) ||
            !message.guild.members.me.permissions.has(PermissionsBitField.Flags.AddReactions)) {
            return message.reply('❌ I need **Send Messages** and **Add Reactions** permissions to create a poll!');
        }

        // Question check kare
        const pollQuestion = args.join(' ');
        if (!pollQuestion) {
            return message.reply('❌ Please provide a question for the poll!');
        }

        // Embed banaye
        const pollEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📊 Poll')
            .setDescription(`**${pollQuestion}**\n\n✅ = Yes\n❌ = No`)
            .setFooter({ text: `Poll created by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        // Poll bheje aur reactions add kare
        const pollMessage = await message.channel.send({ embeds: [pollEmbed] });
        await pollMessage.react('✅'); // Yes
        await pollMessage.react('❌'); // No
    }
};