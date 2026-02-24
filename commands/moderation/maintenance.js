const { PermissionsBitField, EmbedBuilder, ChannelType } = require('discord.js');
const Maintenance = require('../../data/Maintenance'); // DB file

module.exports = {
    name: "maintenance",
    description: "Enable or disable maintenance mode",
    aliases: ["mt"],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor("Red").setDescription("You need `Administrator` permission to use this command.")]
            });
        }

        const subCommand = args[0];
        if (!subCommand || !["on", "off"].includes(subCommand)) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor("Red").setDescription("Usage: `!maintenance on` or `!maintenance off`")]
            });
        }

        const guild = message.guild;
        const everyoneRole = guild.roles.everyone;

        // Maintenance ON
        if (subCommand === "on") {
            const existing = await Maintenance.findOne({ guildId: guild.id });
            if (existing && existing.enabled) {
                return message.reply({ embeds: [new EmbedBuilder().setColor("Yellow").setDescription("Maintenance mode is already enabled.")] });
            }

            let category = guild.channels.cache.find(c => c.name === "🔧 Maintenance Mode" && c.type === ChannelType.GuildCategory);
            if (!category) {
                category = await guild.channels.create({
                    name: "🔧 Maintenance Mode",
                    type: ChannelType.GuildCategory,
                }).catch(console.error);
            }

            // Store originally visible channels
            const hiddenChannels = [];
            guild.channels.cache.forEach(channel => {
                if (channel && channel.permissionsFor(everyoneRole)?.has(PermissionsBitField.Flags.ViewChannel)) {
                    hiddenChannels.push(channel.id);
                    channel.permissionOverwrites.edit(everyoneRole, { ViewChannel: false }).catch(console.error);
                }
            });

            // Create maintenance channels (announcement is now just a normal text channel)
            const maintenanceChannels = [
                { name: "maintenance-announcement", type: ChannelType.GuildText },
                { name: "maintenance-chat", type: ChannelType.GuildText },
                { name: "maintenance-cmds", type: ChannelType.GuildText },
                { name: "maintenance-vc", type: ChannelType.GuildVoice }
            ];

            let announcementChannel;
            for (const chData of maintenanceChannels) {
                if (!guild.channels.cache.find(c => c.name === chData.name)) {
                    const created = await guild.channels.create({
                        name: chData.name,
                        type: chData.type,
                        parent: category,
                        permissionOverwrites: [
                            { id: everyoneRole.id, allow: [PermissionsBitField.Flags.ViewChannel] }
                        ]
                    }).catch(console.error);

                    if (chData.name === "maintenance-announcement") announcementChannel = created;
                    if (chData.name === "maintenance-cmds") {
                        await created.setRateLimitPerUser(10).catch(console.error); // Slowmode
                    }
                }
            }

            // Lock announcement channel and send message
            if (announcementChannel) {
                await announcementChannel.permissionOverwrites.edit(everyoneRole, {
                    SendMessages: false
                }).catch(console.error);

                await announcementChannel.send({
                    content: `We’re sorry for any inconvenience caused by the ongoing server maintenance. We’re working hard to ensure everything runs smoothly and will have things back up as soon as possible. Thank you for your patience and understanding!`
                }).catch(console.error);
            }

            // Save to DB
            await Maintenance.findOneAndUpdate(
                { guildId: guild.id },
                { enabled: true, hiddenChannels },
                { upsert: true }
            );

            return message.channel.send({
                embeds: [new EmbedBuilder().setColor("Green").setDescription("Maintenance Mode Enabled! All channels are hidden, and maintenance channels have been created.")]
            });
        }

        // Maintenance OFF
        if (subCommand === "off") {
            const existing = await Maintenance.findOne({ guildId: guild.id });
            if (!existing || !existing.enabled) {
                return message.reply({ embeds: [new EmbedBuilder().setColor("Yellow").setDescription("Maintenance mode is not currently enabled.")] });
            }

            // Send confirmation before deleting channels
            await message.channel.send({
                embeds: [new EmbedBuilder().setColor("Blue").setDescription("Maintenance Mode Disabled! All channels are restored, and maintenance channels will now be removed.")]
            }).catch(console.error);

            // Unhide previously hidden channels
            for (const channelId of existing.hiddenChannels) {
                const channel = guild.channels.cache.get(channelId);
                if (channel) {
                    channel.permissionOverwrites.edit(everyoneRole, { ViewChannel: true }).catch(console.error);
                }
            }

            // Delete maintenance category and its channels
            const maintenanceCategory = guild.channels.cache.find(c => c.name === "🔧 Maintenance Mode" && c.type === ChannelType.GuildCategory);
            if (maintenanceCategory) {
                for (const child of maintenanceCategory.children.cache.values()) {
                    await child.delete().catch(console.error);
                }
                await maintenanceCategory.delete().catch(console.error);
            }

            // Update DB
            await Maintenance.deleteOne({ guildId: guild.id });
        }
    }
};