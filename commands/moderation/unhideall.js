const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'unhideall',
    description: 'Unhides all channels in the server (Premium Only)',
    premium: true, // ✅ Premium command

    run: async (message, args, client) => {
        // **✅ Premium Check**
        let premiumUsers = JSON.parse(fs.readFileSync('./premium.json', 'utf8'));
        if (!premiumUsers.users[message.author.id] || premiumUsers.users[message.author.id].expiry < Math.floor(Date.now() / 1000)) {
            const premiumEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚀 Premium Command')
                .setDescription(`Hey ${message.author},\nYou just found a **Premium** command, which can only be used in servers with an **Active Premium Subscription.**`)
                .setFooter({ text: 'Click the button below to buy premium' });

            const buyButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Buy Premium')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.gg/5ZJ9TVNafR')
            );

            return message.channel.send({ embeds: [premiumEmbed], components: [buyButton] });
        }

        // **✅ Check Permissions**
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ You need `Manage Channels` permission to use this command.');
        }
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply('❌ I need `Manage Channels` permission to unhide all channels.');
        }

        // **🟠 Processing Embed**
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setDescription('<a:red_loading:1221326019986980894> | **Processing Command Please Wait**');

        const msg = await message.channel.send({ embeds: [embed] });

        // **🕒 2-Second Delay**
        setTimeout(async () => {
            // **🟡 Update Embed to Confirmation**
            embed.setDescription('**Are you sure you want to unhide all channels in this server?**');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm_unhideall')
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Success), // 🟩 Green button
                new ButtonBuilder()
                    .setCustomId('cancel_unhideall')
                    .setLabel('No')
                    .setStyle(ButtonStyle.Danger) // 🟥 Red button
            );

            await msg.edit({ embeds: [embed], components: [row] });

            // **🕐 Collector for Button Response**
            const filter = (interaction) => interaction.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, time: 15000 });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'confirm_unhideall') {
                    await interaction.deferUpdate();

                    // **🟢 Update Embed to "Started Unhiding"**
                    embed.setDescription('<:tick:1343079179641557053> | **Successfully started unhiding all channels.**');
                    await msg.edit({ embeds: [embed], components: [] });

                    let unhiddenChannels = 0;
                    message.guild.channels.cache.forEach(async (channel) => {
                        if (channel.manageable) {
                            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                                ViewChannel: true
                            }).catch(() => {});
                            unhiddenChannels++;
                        }
                    });

                    setTimeout(() => {
                        // **✅ Final Embed (Sent Separately)**
                        message.channel.send({ embeds: [
                            new EmbedBuilder()
                                .setColor('#00FF00')
                                .setDescription(`<:tick:1180470648053702657> | **Successfully unhid ${unhiddenChannels} channels**`)
                        ] });
                    }, 2000);
                } else if (interaction.customId === 'cancel_unhideall') {
                    await interaction.deferUpdate();

                    // **❌ Update Embed to "Cancelled"**
                    embed.setDescription('❌ | **Unhiding process cancelled.**');
                    await msg.edit({ embeds: [embed], components: [] });
                }
            });

            collector.on('end', () => {
                msg.edit({ components: [] }).catch(() => {});
            });

        }, 2000); // **2 sec delay before confirmation embed**
    }
};