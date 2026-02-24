const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    MessageFlags,
    PermissionsBitField
} = require('discord.js');

const BanCommand = {
    name: 'ban',
    aliases: ['b'],
    description: 'Ban a member from the server.',

    async execute(message, args) {
        try {
            const prefix = message.guild.prefix || '&';

            // Permission check
            if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return BanCommand._sendError(
                    message,
                    "Permission Denied",
                    "You need the `Ban Members` permission to use this command."
                );
            }

            // Bot permission check
            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return BanCommand._sendError(
                    message,
                    "Bot Permission Missing",
                    "I need the `Ban Members` permission to execute this command."
                );
            }

            // No args → help UI
            if (!args[0]) {
                return BanCommand._sendError(
                    message,
                    "Missing Arguments",
                    `The correct usage is:\n${prefix}ban <user_mention/id> [reason]\n\n**Examples:**\n${prefix}ban @jack\n${prefix}ban @oggy don't spam\n\n**Aliases:** ${prefix}b`
                );
            }

            // Resolve user
            let member = message.mentions.members.first();
            let user;

            if (!member) {
                try {
                    user = await message.client.users.fetch(args[0]);
                } catch {
                    user = null;
                }
            } else {
                user = member.user;
            }

            if (!user) {
                return BanCommand._sendError(
                    message,
                    "Invalid User",
                    "Could not find a user by that mention or ID."
                );
            }

            // Ban target restrictions
            if (user.id === message.client.user.id) {
                return BanCommand._sendError(
                    message,
                    "Invalid Target",
                    "If you ban me, who will protect your server?"
                );
            }
            if (user.id === message.guild.ownerId) {
                return BanCommand._sendError(
                    message,
                    "Invalid Target",
                    "You cannot ban the server owner."
                );
            }

            // Role hierarchy check
            const isOwner = message.author.id === message.guild.ownerId;
            const authorPos = message.member.roles.highest?.position || 0;
            const botPos = message.guild.members.me.roles.highest?.position || 0;

            if (!isOwner && authorPos <= botPos) {
                return BanCommand._sendError(
                    message,
                    "Role Hierarchy",
                    "You must have a higher role than me to use this command."
                );
            }

            // Reason
            const reason = args.slice(1).join(" ") || "No Reason Provided";
            const fullReason = `${message.author.tag} (${message.author.id}) | ${reason}`;

            // Fetch GuildMember if exists
            let guildMember;
            try {
                guildMember = await message.guild.members.fetch(user.id);
            } catch {
                guildMember = null;
            }

            // Bannable check if member exists
            if (guildMember && !guildMember.bannable) {
                return BanCommand._sendError(
                    message,
                    "Cannot Ban",
                    "My role is below this member or I lack permission."
                );
            }

            // DM notify
            try {
                await user.send({
                    components: [
                        BanCommand._createDMContainer(
                            "You Have Been Banned",
                            `You have been banned from **${message.guild.name}**.\n**Executor:** ${message.author.tag}\n**Reason:** ${reason}`,
                            message.guild
                        )
                    ],
                    flags: MessageFlags.IsComponentsV2
                });
            } catch {}

            // Execute ban
            try {
                if (guildMember) {
                    await guildMember.ban({ reason: fullReason });
                } else {
                    await message.guild.bans.create(user.id, { reason: fullReason });
                }

                return BanCommand._sendSuccess(
                    message,
                    "User Banned",
                    `Successfully banned **${user.tag}**.\n**Reason:** ${reason}`,
                    user.displayAvatarURL()
                );
            } catch {
                return BanCommand._sendError(
                    message,
                    "Ban Failed",
                    `Failed to ban **${user.tag}**. My role may be below theirs, or I lack permission.`
                );
            }
        } catch (error) {
            console.error("Error in ban command:", error);
            return BanCommand._sendError(
                message,
                "Unexpected Error",
                "An error occurred while trying to ban the member. Please try again."
            );
        }
    },

    _sendError(message, title, description) {
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
                    new ThumbnailBuilder().setURL("https://cdn.discordapp.com/embed/avatars/0.png")
                )
        );
        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },

    _sendSuccess(message, title, description, avatarURL = null) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${title}`)
        );
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`> ${description}`),
                    new TextDisplayBuilder().setContent(`Executed by **${message.author.tag}**`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(
                        avatarURL || "https://cdn.discordapp.com/embed/avatars/1.png"
                    )
                )
        );
        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    },

    _createDMContainer(title, description, guild) {
        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# ${title}`)
        );
        container.addSeparatorComponents(new SeparatorBuilder());
        container.addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> ${description}`))
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(
                        guild.iconURL({ format: "png", dynamic: true, size: 1024 }) ||
                            "https://cdn.discordapp.com/embed/avatars/0.png"
                    )
                )
        );
        return container;
    }
};

module.exports = BanCommand;