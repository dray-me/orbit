const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    MessageFlags,
    PermissionsBitField
} = require('discord.js');

module.exports = {
    name: 'lock',
    description: 'Locks the current channel',
    
    run: async (message, args, client) => {
        try {
            console.log('Lock command executed'); // Debug log

            // Basic permission check
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# Permission Denied")
                );
                container.addSeparatorComponents(new SeparatorBuilder());
                container.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent("> You need the `Manage Channels` permission to use this command.")
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

            // Bot permission check
            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# Bot Permission Missing")
                );
                container.addSeparatorComponents(new SeparatorBuilder());
                container.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent("> I need the `Manage Channels` permission to execute this command.")
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

            const channel = message.channel;
            const everyoneRole = message.guild.roles.everyone;

            // Check if already locked
            const currentOverwrite = channel.permissionOverwrites.cache.get(everyoneRole.id);
            const isLocked = currentOverwrite && currentOverwrite.deny.has(PermissionsBitField.Flags.SendMessages);

            if (isLocked) {
                const container = new ContainerBuilder();
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# Already Locked")
                );
                container.addSeparatorComponents(new SeparatorBuilder());
                container.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`> **${channel.name}** is already locked.`)
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

            // Lock the channel
            await channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false
            });

            // Success response
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# Channel Locked")
            );
            container.addSeparatorComponents(new SeparatorBuilder());
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`> Successfully locked **${channel.name}**.`),
                        new TextDisplayBuilder().setContent(`Executed by **${message.author.tag}**`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(
                            message.guild.iconURL({ format: 'png', dynamic: true, size: 1024 }) || 
                            'https://cdn.discordapp.com/embed/avatars/1.png'
                        )
                    )
            );

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });

        } catch (error) {
            console.error('Lock command error:', error);

            // Simple error response
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# Error")
            );
            container.addSeparatorComponents(new SeparatorBuilder());
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("> An error occurred while trying to lock the channel.")
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
    }
};
