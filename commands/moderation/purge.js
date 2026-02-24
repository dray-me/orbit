const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'purge',
    description: 'Clears a specified number of messages.',
    aliases: ['clear'],
    run: async (message, args, client) => {
        // ✅ Permission Check
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ | You need `Manage Messages` permission to use this command.')
                ]
            });
        }
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ | I need `Manage Messages` permission to delete messages.')
                ]
            });
        }

        // ✅ No Number Provided
        if (!args[0]) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ | You must provide the number of messages to be deleted.')
                ]
            });
        }

        // ✅ Parse Number Input
        let amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ | You must provide a valid number of messages to be deleted.')
                ]
            });
        }

        // ✅ Limit Check (Max: 1000)
        if (amount > 1000) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ | You can\'t delete more than **1000** messages at a time.')
                ]
            });
        }

        // ✅ Bulk Delete
        await message.channel.bulkDelete(amount, true).then(deletedMessages => {
            message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#00FF00')
                        .setDescription(`✅ | Successfully deleted **${deletedMessages.size}** messages.`)
                ]
            }).then(msg => setTimeout(() => msg.delete(), 3000)); // Auto-delete confirmation message
        }).catch(err => {
            console.error(err);
            message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ | An error occurred while deleting messages. Make sure messages are not older than 14 days.')
                ]
            });
        });
    }
};