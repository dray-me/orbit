const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} = require('discord.js');

// Verification levels mapping
const verificationLevels = {
    0: 'None',
    1: 'Low', 
    2: 'Medium',
    3: 'High',
    4: 'Very High'
};

// Boost tiers mapping
const booster = {
    0: 'Level 0',
    1: 'Level 1',
    2: 'Level 2', 
    3: 'Level 3'
};

const disabled = '❌';
const enabled = '✅';

const ServerInfoCommand = {
    name: 'serverinfo',
    description: 'Shows detailed information about the server.',

    async execute(message) {
        try {
            const { guild } = message;

            if (!guild) {
                console.error("❌ Error: Guild not found!");
                return ServerInfoCommand._sendError(message, "Error", "Unable to fetch server details.");
            }

            const page = "general";
            await ServerInfoCommand._showServerInfo(message, guild, page, message.author.id);

        } catch (error) {
            console.error('❌ Error in serverinfo command:', error);
            return ServerInfoCommand._sendError(message, "Error", "An error occurred while fetching server information.");
        }
    },

    async _showServerInfo(message, guild, page, authorId) {
        let bans;
        try {
            bans = await guild.bans.fetch().then(bans => bans.size);
        } catch (error) {
            bans = 'No permission to view bans';
        }

        const createdTimestamp = guild.createdTimestamp;
        const members = guild.memberCount;
        const channels = guild.channels.cache;
        const emojis = guild.emojis.cache;

        const container = new ContainerBuilder();
        
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${guild.name}'s Information`)
        );
        
        container.addSeparatorComponents(new SeparatorBuilder());

        let contentText = "";
        
        if (page === "general") {
            contentText = `> **About**\n` +
                `> **Name:** ${guild.name}\n` +
                `> **ID:** ${guild.id}\n` +
                `> **Owner:** <@${guild.ownerId}> (${guild.ownerId})\n` +
                `> **Created at:** <t:${Math.floor(createdTimestamp / 1000)}:R>\n` +
                `> **Members:** ${members}\n` +
                `> **Banned Members:** ${bans}\n\n` +
                
                `> **Server Information**\n` +
                `> **Verification Level:** ${verificationLevels[guild.verificationLevel]}\n` +
                `> **Inactive Channel:** ${guild.afkChannelId ? `<#${guild.afkChannelId}>` : disabled}\n` +
                `> **Inactive Timeout:** ${guild.afkTimeout / 60} mins\n` +
                `> **System Messages Channel:** ${guild.systemChannelId ? `<#${guild.systemChannelId}>` : disabled}\n` +
                `> **Boost Bar Enabled:** ${guild.premiumProgressBarEnabled ? enabled : disabled}\n\n` +
                
                `> **Channels**\n` +
                `> **Total:** ${channels.size}\n` +
                `> **Text Channels:** ${channels.filter(channel => channel.type === 0).size} | **Voice Channels:** ${channels.filter(channel => channel.type === 2).size}\n\n` +
                
                `> **Emoji Info**\n` +
                `> **Regular:** ${emojis.filter(emoji => !emoji.animated).size}\n` +
                `> **Animated:** ${emojis.filter(emoji => emoji.animated).size}\n` +
                `> **Total:** ${emojis.size}\n\n` +
                
                `> **Boost Status**\n` +
                `> ${booster[guild.premiumTier]} [${guild.premiumSubscriptionCount || '0'} Boosts]`;
                
        } else if (page === "roles") {
            const roles = guild.roles.cache
                .sort((a, b) => b.position - a.position)
                .filter(role => role.name !== '@everyone');

            const roleLimit = 80;
            const rolesToShow = roles.first(roleLimit);
            const remainingRoles = roles.size - roleLimit;

            let rolesdisplay = '';
            if (rolesToShow.length > 0) {
                const roleString = rolesToShow.map(role => role.toString()).join(' ');
                rolesdisplay = roleString;
                
                if (remainingRoles > 0) {
                    rolesdisplay += ` **+${remainingRoles} more roles**`;
                }
            } else {
                rolesdisplay = 'None';
            }

            // Check if content exceeds reasonable limits and truncate if needed
            if (rolesdisplay.length > 3000) {
                const truncatedRoles = rolesToShow.first(50);
                rolesdisplay = truncatedRoles.map(role => role.toString()).join(' ') + ` **+${roles.size - 50} more roles**`;
            }

            contentText = `> **Server Roles [${roles.size}]**\n` +
                `> ${rolesdisplay}`;
                
        } else if (page === "features") {
            const features = guild.features;
            let featuresDisplay = features.length > 0 ? 
                features.map(feature => `• ${feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}`).join('\n') : 
                'No special features enabled';

            contentText = `> **Server Features**\n` +
                `> ${featuresDisplay}\n\n` +
                `> **Additional Information**\n` +
                `> **Large Server:** ${guild.large ? enabled : disabled}\n` +
                `> **Partner:** ${guild.partnered ? enabled : disabled}\n` +
                `> **Verified:** ${guild.verified ? enabled : disabled}\n` +
                `> **Max Members:** ${guild.maximumMembers || 'Unknown'}\n` +
                `> **Max Presences:** ${guild.maximumPresences || 'Unknown'}`;
        }

        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(contentText),
                    new TextDisplayBuilder().setContent(`Requested by **${message.author ? message.author.tag : 'Unknown User'}**`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(
                        guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) || 
                        'https://cdn.discordapp.com/embed/avatars/0.png'
                    )
                )
        );

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('serverinfo_general')
                .setLabel('General')
                .setStyle(page === 'general' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'general'),
                
            new ButtonBuilder()
                .setCustomId('serverinfo_roles')
                .setLabel('Roles')
                .setStyle(page === 'roles' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'roles'),
                
            new ButtonBuilder()
                .setCustomId('serverinfo_features')
                .setLabel('Features')
                .setStyle(page === 'features' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'features')
        );

        container.addActionRowComponents(buttons);

        const reply = await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        ServerInfoCommand._setupCollector(reply, authorId, guild);
    },

    _setupCollector(message, authorId, guild) {
        const collector = message.createMessageComponentCollector({
            filter: (i) => {
                if (i.user.id !== authorId) {
                    i.reply({
                        content: "❌ Only the command executor can use these buttons!",
                        ephemeral: true
                    });
                    return false;
                }
                return true;
            },
            time: 300_000,
        });

        collector.on('collect', async (interaction) => {
            await interaction.deferUpdate();
            
            let page = 'general';
            if (interaction.customId === 'serverinfo_roles') page = 'roles';
            else if (interaction.customId === 'serverinfo_features') page = 'features';

            await ServerInfoCommand._updateServerInfo(interaction, guild, page, authorId);
        });

        collector.on('end', async () => {
            try {
                const fetchedMessage = await message.fetch().catch(() => null);
                if (fetchedMessage && fetchedMessage.components.length > 0) {
                    const disabledComponents = fetchedMessage.components.map(row => {
                        const newRow = new ActionRowBuilder();
                        row.components.forEach(comp => {
                            const newComp = ButtonBuilder.from(comp).setDisabled(true);
                            newRow.addComponents(newComp);
                        });
                        return newRow;
                    });
                    
                    const container = new ContainerBuilder();
                    container.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${guild.name}'s Information`)
                    );
                    container.addSeparatorComponents(new SeparatorBuilder());
                    container.addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent("> **This interaction has expired.**")
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder().setURL(
                                    guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) || 
                                    'https://cdn.discordapp.com/embed/avatars/0.png'
                                )
                            )
                    );
                    container.addActionRowComponents(...disabledComponents);

                    await fetchedMessage.edit({
                        components: [container],
                        flags: MessageFlags.IsComponentsV2
                    });
                }
            } catch (error) {
                console.error("Failed to disable serverinfo components:", error);
            }
        });
    },

    async _updateServerInfo(interaction, guild, page, authorId) {
        let bans;
        try {
            bans = await guild.bans.fetch().then(bans => bans.size);
        } catch (error) {
            bans = 'No permission to view bans';
        }

        const createdTimestamp = guild.createdTimestamp;
        const members = guild.memberCount;
        const channels = guild.channels.cache;
        const emojis = guild.emojis.cache;

        const container = new ContainerBuilder();
        
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${guild.name}'s Information`)
        );
        
        container.addSeparatorComponents(new SeparatorBuilder());

        let contentText = "";
        
        if (page === "general") {
            contentText = `> **About**\n` +
                `> **Name:** ${guild.name}\n` +
                `> **ID:** ${guild.id}\n` +
                `> **Owner:** <@${guild.ownerId}> (${guild.ownerId})\n` +
                `> **Created at:** <t:${Math.floor(createdTimestamp / 1000)}:R>\n` +
                `> **Members:** ${members}\n` +
                `> **Banned Members:** ${bans}\n\n` +
                
                `> **Server Information**\n` +
                `> **Verification Level:** ${verificationLevels[guild.verificationLevel]}\n` +
                `> **Inactive Channel:** ${guild.afkChannelId ? `<#${guild.afkChannelId}>` : disabled}\n` +
                `> **Inactive Timeout:** ${guild.afkTimeout / 60} mins\n` +
                `> **System Messages Channel:** ${guild.systemChannelId ? `<#${guild.systemChannelId}>` : disabled}\n` +
                `> **Boost Bar Enabled:** ${guild.premiumProgressBarEnabled ? enabled : disabled}\n\n` +
                
                `> **Channels**\n` +
                `> **Total:** ${channels.size}\n` +
                `> **Text Channels:** ${channels.filter(channel => channel.type === 0).size} | **Voice Channels:** ${channels.filter(channel => channel.type === 2).size}\n\n` +
                
                `> **Emoji Info**\n` +
                `> **Regular:** ${emojis.filter(emoji => !emoji.animated).size}\n` +
                `> **Animated:** ${emojis.filter(emoji => emoji.animated).size}\n` +
                `> **Total:** ${emojis.size}\n\n` +
                
                `> **Boost Status**\n` +
                `> ${booster[guild.premiumTier]} [${guild.premiumSubscriptionCount || '0'} Boosts]`;
                
        } else if (page === "roles") {
            const roles = guild.roles.cache
                .sort((a, b) => b.position - a.position)
                .filter(role => role.name !== '@everyone');

            const roleLimit = 80;
            const rolesToShow = roles.first(roleLimit);
            const remainingRoles = roles.size - roleLimit;

            let rolesdisplay = '';
            if (rolesToShow.length > 0) {
                const roleString = rolesToShow.map(role => role.toString()).join(' ');
                rolesdisplay = roleString;
                
                if (remainingRoles > 0) {
                    rolesdisplay += ` **+${remainingRoles} more roles**`;
                }
            } else {
                rolesdisplay = 'None';
            }

            // Check if content exceeds reasonable limits and truncate if needed
            if (rolesdisplay.length > 3000) {
                const truncatedRoles = rolesToShow.first(50);
                rolesdisplay = truncatedRoles.map(role => role.toString()).join(' ') + ` **+${roles.size - 50} more roles**`;
            }

            contentText = `> **Server Roles [${roles.size}]**\n` +
                `> ${rolesdisplay}`;
                
        } else if (page === "features") {
            const features = guild.features;
            let featuresDisplay = features.length > 0 ? 
                features.map(feature => `• ${feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}`).join('\n') : 
                'No special features enabled';

            contentText = `> **Server Features**\n` +
                `> ${featuresDisplay}\n\n` +
                `> **Additional Information**\n` +
                `> **Large Server:** ${guild.large ? enabled : disabled}\n` +
                `> **Partner:** ${guild.partnered ? enabled : disabled}\n` +
                `> **Verified:** ${guild.verified ? enabled : disabled}\n` +
                `> **Max Members:** ${guild.maximumMembers || 'Unknown'}\n` +
                `> **Max Presences:** ${guild.maximumPresences || 'Unknown'}`;
        }

        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(contentText),
                    new TextDisplayBuilder().setContent(`Requested by **${interaction.user.tag}**`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(
                        guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) || 
                        'https://cdn.discordapp.com/embed/avatars/0.png'
                    )
                )
        );

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('serverinfo_general')
                .setLabel('General')
                .setStyle(page === 'general' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'general'),
                
            new ButtonBuilder()
                .setCustomId('serverinfo_roles')
                .setLabel('Roles')
                .setStyle(page === 'roles' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'roles'),
                
            new ButtonBuilder()
                .setCustomId('serverinfo_features')
                .setLabel('Features')
                .setStyle(page === 'features' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'features')
        );

        container.addActionRowComponents(buttons);

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },

    async _sendError(message, title, description) {
        const container = new ContainerBuilder();
        
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${title}`)
        );
        
        container.addSeparatorComponents(new SeparatorBuilder());

        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`> ${description}`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL('https://cdn.discordapp.com/embed/avatars/0.png')
                )
        );

        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};

module.exports = ServerInfoCommand;
