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

const UserInfoCommand = {
    name: 'userinfo',
    aliases: ['ui', 'whois'],
    description: 'Get detailed information about a user',

    async execute(message, args) {
        let targetUser;
        
        if (args.length > 0) {
            const mention = args[0].match(/^<@!?(\d+)>$/);
            const userId = mention ? mention[1] : args[0];
            
            try {
                targetUser = await message.client.users.fetch(userId);
            } catch (error) {
                return UserInfoCommand._sendError(message, "Error", "Could not find that user.");
            }
        } else {
            targetUser = message.author;
        }

        try {
            const user = await message.client.users.fetch(targetUser.id, { force: true });
            const member = message.guild?.members.cache.get(user.id);
            
            const page = "general";
            await UserInfoCommand._showUserInfo(message, user, member, page, message.author.id);

        } catch (error) {
            console.error('Error in userinfo command:', error);
            return UserInfoCommand._sendError(message, "Error", "An error occurred while fetching user information.");
        }
    },

    async _showUserInfo(message, user, member, page, authorId) {
        const formatDate = (date) => {
            return {
                date: date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                time: date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            };
        };

        const container = new ContainerBuilder();
        
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${user.username}'s Information`)
        );
        
        container.addSeparatorComponents(new SeparatorBuilder());

        let contentText = "";
        
        if (page === "general") {
            const bannerURL = user.bannerURL({ size: 4096, dynamic: true });
            
            contentText = `> **User Information**\n` +
                `> **Username:** ${user.tag} ${user.bot ? 'Bot' : ''}\n` +
                `> **User ID:** ${user.id}\n` +
                `> **Account Created:** ${formatDate(user.createdAt).date} at ${formatDate(user.createdAt).time}\n`;

            if (bannerURL) {
                contentText += `> **Banner:** [View Full Banner](${bannerURL})\n`;
            }

            if (member) {
                contentText += `\n> **Server Information**\n` +
                    `> **Server Nickname:** ${member.nickname || 'None'}\n` +
                    `> **Joined Server:** ${formatDate(member.joinedAt).date} at ${formatDate(member.joinedAt).time}\n` +
                    `> **Highest Role:** ${member.roles.highest.toString()}\n`;

                if (member.presence) {
                    const status = member.presence.status;
                    let statusText = '';
                    switch(status) {
                        case 'online': statusText = 'Online'; break;
                        case 'idle': statusText = 'Idle'; break;
                        case 'dnd': statusText = 'Do Not Disturb'; break;
                        case 'offline': statusText = 'Offline'; break;
                        default: statusText = 'Unknown'; break;
                    }

                    const activities = member.presence.activities;
                    if (activities.length > 0) {
                        const activity = activities[0];
                        statusText += ` - ${activity.type === 'CUSTOM_STATUS' ? 'Custom Status' : activity.type}: ${activity.name}`;
                        if (activity.details) statusText += ` (${activity.details})`;
                    }

                    contentText += `> **Status:** ${statusText}\n`;
                }
            } else {
                contentText += `\n> **Server Information**\n` +
                    `> **Member Status:** Not in this server\n`;
            }

        } else if (page === "perms") {
            if (member) {
                const permissions = member.permissions.toArray();
                const adminPerms = ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels', 'ManageMessages', 'BanMembers', 'KickMembers'];
                const modPerms = ['ModerateMembers', 'ManageNicknames', 'MuteMembers', 'DeafenMembers', 'MoveMembers'];
                const basicPerms = ['SendMessages', 'ReadMessageHistory', 'ViewChannel', 'Connect', 'Speak'];

                let adminList = permissions.filter(perm => adminPerms.includes(perm)).join(', ') || 'None';
                let modList = permissions.filter(perm => modPerms.includes(perm)).join(', ') || 'None';
                let basicList = permissions.filter(perm => basicPerms.includes(perm)).join(', ') || 'None';

                contentText = `> **Administrative Permissions**\n` +
                    `> ${adminList}\n\n` +
                    `> **Moderation Permissions**\n` +
                    `> ${modList}\n\n` +
                    `> **Basic Permissions**\n` +
                    `> ${basicList}\n\n` +
                    `> **Total Permissions:** ${permissions.length}`;
            } else {
                contentText = `> **Permission Information**\n` +
                    `> User is not a member of this server`;
            }

        } else if (page === "roles") {
            if (member) {
                const roles = member.roles.cache
                    .filter(role => role.id !== message.guild.id)
                    .sort((a, b) => b.position - a.position);

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

                contentText = `> **User Roles [${roles.size}]**\n` +
                    `> ${rolesdisplay}`;
            } else {
                contentText = `> **Role Information**\n` +
                    `> User is not a member of this server`;
            }
        }

        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(contentText),
                    new TextDisplayBuilder().setContent(`Requested by **${message.author ? message.author.tag : 'Unknown User'}**`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(
                        user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) || 
                        'https://cdn.discordapp.com/embed/avatars/0.png'
                    )
                )
        );

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('userinfo_general')
                .setLabel('General')
                .setStyle(page === 'general' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'general'),
                
            new ButtonBuilder()
                .setCustomId('userinfo_perms')
                .setLabel('Perms')
                .setStyle(page === 'perms' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'perms'),
                
            new ButtonBuilder()
                .setCustomId('userinfo_roles')
                .setLabel('Roles')
                .setStyle(page === 'roles' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'roles')
        );

        container.addActionRowComponents(buttons);

        const reply = await message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });

        UserInfoCommand._setupCollector(reply, authorId, user, member, message.guild);
    },

    _setupCollector(message, authorId, user, member, guild) {
        const collector = message.createMessageComponentCollector({
            filter: (i) => {
                if (i.user.id !== authorId) {
                    i.reply({
                        content: "Only the command executor can use these buttons!",
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
            if (interaction.customId === 'userinfo_perms') page = 'perms';
            else if (interaction.customId === 'userinfo_roles') page = 'roles';

            await UserInfoCommand._updateUserInfo(interaction, user, member, page, authorId, guild);
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
                        new TextDisplayBuilder().setContent(`# ${user.username}'s Information`)
                    );
                    container.addSeparatorComponents(new SeparatorBuilder());
                    container.addSectionComponents(
                        new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent("> **This interaction has expired.**")
                            )
                            .setThumbnailAccessory(
                                new ThumbnailBuilder().setURL(
                                    user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) || 
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
                console.error("Failed to disable userinfo components:", error);
            }
        });
    },

    async _updateUserInfo(interaction, user, member, page, authorId, guild) {
        const formatDate = (date) => {
            return {
                date: date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
                time: date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            };
        };

        const container = new ContainerBuilder();
        
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${user.username}'s Information`)
        );
        
        container.addSeparatorComponents(new SeparatorBuilder());

        let contentText = "";
        
        if (page === "general") {
            const bannerURL = user.bannerURL({ size: 4096, dynamic: true });
            
            contentText = `> **User Information**\n` +
                `> **Username:** ${user.tag} ${user.bot ? 'Bot' : ''}\n` +
                `> **User ID:** ${user.id}\n` +
                `> **Account Created:** ${formatDate(user.createdAt).date} at ${formatDate(user.createdAt).time}\n`;

            if (bannerURL) {
                contentText += `> **Banner:** [View Full Banner](${bannerURL})\n`;
            }

            if (member) {
                contentText += `\n> **Server Information**\n` +
                    `> **Server Nickname:** ${member.nickname || 'None'}\n` +
                    `> **Joined Server:** ${formatDate(member.joinedAt).date} at ${formatDate(member.joinedAt).time}\n` +
                    `> **Highest Role:** ${member.roles.highest.toString()}\n`;

                if (member.presence) {
                    const status = member.presence.status;
                    let statusText = '';
                    switch(status) {
                        case 'online': statusText = 'Online'; break;
                        case 'idle': statusText = 'Idle'; break;
                        case 'dnd': statusText = 'Do Not Disturb'; break;
                        case 'offline': statusText = 'Offline'; break;
                        default: statusText = 'Unknown'; break;
                    }

                    const activities = member.presence.activities;
                    if (activities.length > 0) {
                        const activity = activities[0];
                        statusText += ` - ${activity.type === 'CUSTOM_STATUS' ? 'Custom Status' : activity.type}: ${activity.name}`;
                        if (activity.details) statusText += ` (${activity.details})`;
                    }

                    contentText += `> **Status:** ${statusText}\n`;
                }
            } else {
                contentText += `\n> **Server Information**\n` +
                    `> **Member Status:** Not in this server\n`;
            }

        } else if (page === "perms") {
            if (member) {
                const permissions = member.permissions.toArray();
                const adminPerms = ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels', 'ManageMessages', 'BanMembers', 'KickMembers'];
                const modPerms = ['ModerateMembers', 'ManageNicknames', 'MuteMembers', 'DeafenMembers', 'MoveMembers'];
                const basicPerms = ['SendMessages', 'ReadMessageHistory', 'ViewChannel', 'Connect', 'Speak'];

                let adminList = permissions.filter(perm => adminPerms.includes(perm)).join(', ') || 'None';
                let modList = permissions.filter(perm => modPerms.includes(perm)).join(', ') || 'None';
                let basicList = permissions.filter(perm => basicPerms.includes(perm)).join(', ') || 'None';

                contentText = `> **Administrative Permissions**\n` +
                    `> ${adminList}\n\n` +
                    `> **Moderation Permissions**\n` +
                    `> ${modList}\n\n` +
                    `> **Basic Permissions**\n` +
                    `> ${basicList}\n\n` +
                    `> **Total Permissions:** ${permissions.length}`;
            } else {
                contentText = `> **Permission Information**\n` +
                    `> User is not a member of this server`;
            }

        } else if (page === "roles") {
            if (member) {
                const roles = member.roles.cache
                    .filter(role => role.id !== guild.id)
                    .sort((a, b) => b.position - a.position);

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

                contentText = `> **User Roles [${roles.size}]**\n` +
                    `> ${rolesdisplay}`;
            } else {
                contentText = `> **Role Information**\n` +
                    `> User is not a member of this server`;
            }
        }

        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(contentText),
                    new TextDisplayBuilder().setContent(`Requested by **${interaction.user.tag}**`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(
                        user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) || 
                        'https://cdn.discordapp.com/embed/avatars/0.png'
                    )
                )
        );

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('userinfo_general')
                .setLabel('General')
                .setStyle(page === 'general' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'general'),
                
            new ButtonBuilder()
                .setCustomId('userinfo_perms')
                .setLabel('Perms')
                .setStyle(page === 'perms' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'perms'),
                
            new ButtonBuilder()
                .setCustomId('userinfo_roles')
                .setLabel('Roles')
                .setStyle(page === 'roles' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                .setDisabled(page === 'roles')
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

module.exports = UserInfoCommand;
