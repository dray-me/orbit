const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'deletechannel',
    aliases: ['delete ch'],
    description: 'Deletes the mentioned or current channel with confirmation',
    
    run: async (message, args, client) => {
        // ✅ **Check Permissions**
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ You need `Manage Channels` permission to use this command.');
        }
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ I need `Manage Channels` permission to delete a channel.');
        }

        // 🏷️ **Get Channel to Delete**
        let channel = message.mentions.channels.first() || message.channel;
        if (!channel) return message.reply('❌ Please mention a channel or use this command in the channel you want to delete.');

        // ⚠️ **Warning Embed**
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⚠️ Delete Channel')
            .setDescription(`Are you sure you want to delete **${channel.name}**? This action **cannot** be undone.`)
            .setFooter({ text: 'Press the Delete button to confirm.' });

        // 🟥 **Delete Button**
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_deletechannel')
                .setLabel('Delete')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️') // 🗑️ Trash bin emoji
        );

        const msg = await message.channel.send({ embeds: [embed], components: [row] });

        // 🕐 **Collector for Button Response**
        const filter = (interaction) => interaction.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'confirm_deletechannel') {
                await interaction.deferUpdate();

                // ✅ **Deleting Message**
                embed.setDescription(`✅ **${channel.name}** is being deleted...`);
                await msg.edit({ embeds: [embed], components: [] });

                // 🗑️ **Delete Channel**
                setTimeout(() => {
                    channel.delete().catch(() => {
                        message.channel.send('❌ Failed to delete the channel.');
                    });
                }, 2000);
            }
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(() => {});
        });
    }
};