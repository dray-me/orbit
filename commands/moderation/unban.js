const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    MessageFlags,
    PermissionsBitField
} = require('discord.js');

const UnbanCommand = {
    name: 'unban',
    aliases: ['ub'],
    description: 'Unban a user from the server.',

    async execute(message, args) {
        try {
            const prefix = message.guild.prefix || '&';

            // Permission check
            if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return UnbanCommand._sendError(
                    message,
                    "Permission Denied",
                    "You need the `Ban Members` permission to use this command."
                );
            }

            // Bot permission check
            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return UnbanCommand._sendError(
                    message,
                    "Bot Permission Missing",
                    "I need the `Ban Members` permission to execute this command."
                );
            }

            // No args → help UI
            if (!args[0]) {
                return UnbanCommand._sendError(
                    message,
                    "Missing Arguments",
                    `The correct usage is:\n${prefix}unban <user_id> [reason]\n\n**Example:**\n${prefix}unban 123456789012345678`
                );
            }

            const userId = args[0];
            let reason = args.slice(1).join(" ") || "No Reason Provided";
            const fullReason = `${message.author.tag} (${message.author.id}) | ${reason}`;

            // Fetch ban list
            let bannedUser;
            try {
                const bans = await message.guild.bans.fetch();
                bannedUser = bans.get(userId);
            } catch (err) {
                return UnbanCommand._sendError(
                    message,
                    "Error",
                    "I couldn’t fetch the ban list. Please try again later."
                );
            }

            if (!bannedUser) {
                return UnbanCommand._sendError(
                    message,
                    "Invalid User",
                    `No banned user found with ID \`${userId}\`.`
                );
            }

            // Try to unban
            try {
                await message.guild.bans.remove(userId, fullReason);

                return UnbanCommand._sendSuccess(
                    message,
                    "User Unbanned",
                    `Successfully unbanned **${bannedUser.user.tag}**.\n**Reason:** ${reason}`,
                    bannedUser.user.displayAvatarURL()
                );
            } catch (err) {
                return UnbanCommand._sendError(
                    message,
                    "Unban Failed",
                    `Failed to unban <@${userId}>. I may lack permissions.`
                );
            }
        } catch (error) {
            console.error("Error in unban command:", error);
            return UnbanCommand._sendError(
                message,
                "Unexpected Error",
                "An error occurred while trying to unban the user. Please try again."
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

module.exports = UnbanCommand;