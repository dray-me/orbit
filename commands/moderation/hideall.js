const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'hideall',
    description: 'Hides all channels in the server for @everyone',

    run: async (message, args, client) => {
        // **✅ Check Permissions**
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('<:cross:1362840470987870420> | You need `Manage Channels` permission to use this command.');
        }
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('<:cross:1362840470987870420> | I need `Manage Channels` permission to hide all channels.');
        }

        // **🟠 Processing Embed**
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setDescription('<a:Load:1363574418965790901> | **Processing Command Please Wait**');

        const msg = await message.channel.send({ embeds: [embed] });

        // **🕒 2-Second Delay**
        setTimeout(async () => {
            // **🟡 Update Embed to Confirmation**
            embed.setDescription('**Are you sure you want to hide all channels in this server?**');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_hideall')
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Success), // 🟩 Green button
                new ButtonBuilder()
                    .setCustomId('cancel_hideall')
                    .setLabel('No')
                    .setStyle(ButtonStyle.Danger) // 🟥 Red button
            );

            await msg.edit({ embeds: [embed], components: [row] });

            // **🕐 Collector for Button Response**
            const filter = (interaction) => interaction.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'confirm_hideall') {
                    await interaction.deferUpdate();

                    // **🟢 Update Embed to "Started Hiding"**
                    embed.setDescription('<:tick:1362840468668551198> | **Successfully started hiding all channels.**');
                    await msg.edit({ embeds: [embed], components: [] });

                    let hiddenChannels = 0;
                    message.guild.channels.cache.forEach(async (channel) => {
                        if (channel.manageable) {
                            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                                ViewChannel: false
                            }).catch(() => {});
                            hiddenChannels++;
                        }
                    });

                    setTimeout(() => {
                        // **✅ Final Embed (Sent Separately)**
                        message.channel.send({ embeds: [
                            new EmbedBuilder()
                                .setColor('#00FF00')
                                .setDescription(`<:tick:1362840468668551198> | **Successfully hid ${hiddenChannels} channels**`)
                        ] });
                    }, 2000);
                } else if (interaction.customId === 'cancel_hideall') {
                    await interaction.deferUpdate();

                    // **❌ Update Embed to "Cancelled"**
                    embed.setDescription('<:cross:1362840470987870420> | **Hiding process cancelled.**');
                    await msg.edit({ embeds: [embed], components: [] });
                }
            });

            collector.on('end', () => {
                msg.edit({ components: [] }).catch(() => {});
            });

        }, 2000); // **2 sec delay before confirmation embed**
    }
};