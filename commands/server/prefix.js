const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    MessageFlags
} = require("discord.js");
const Prefix = require("../../data/Prefix.js");
const config = require("../../config.json");

module.exports = {
    name: "prefix",
    description: "Change the bot prefix for this server",
    usage: "<new prefix>",

    async execute(message, args) {
        // ✅ Only allow server owner
        if (message.guild.ownerId !== message.author.id) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# Permission Denied")
            );
            container.addSeparatorComponents(new SeparatorBuilder());
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("❌ Only the **server owner** can change the prefix.")
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(
                            message.guild.iconURL({ format: "png", dynamic: true, size: 1024 }) ||
                            "https://cdn.discordapp.com/embed/avatars/1.png"
                        )
                    )
            );

            return message.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        // ❌ If no prefix is given
        if (!args[0]) {
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# Missing Argument")
            );
            container.addSeparatorComponents(new SeparatorBuilder());
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`❌ | Please provide a new prefix. Example: \`${config.defaultPrefix}prefix !\``)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(
                            message.guild.iconURL({ format: "png", dynamic: true, size: 1024 }) ||
                            "https://cdn.discordapp.com/embed/avatars/1.png"
                        )
                    )
            );

            return message.channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }

        const newPrefix = args[0];

        try {
            await Prefix.findOneAndUpdate(
                { guildId: message.guild.id },
                { prefix: newPrefix },
                { upsert: true, new: true }
            );

            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# Prefix Updated")
            );
            container.addSeparatorComponents(new SeparatorBuilder());
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`✅ | Server prefix updated to: \`${newPrefix}\``),
                        new TextDisplayBuilder().setContent(`Use \`${newPrefix}help\` for commands`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(
                            message.guild.iconURL({ format: "png", dynamic: true, size: 1024 }) ||
                            "https://cdn.discordapp.com/embed/avatars/1.png"
                        )
                    )
            );

            return message.channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        } catch (err) {
            console.error(err);

            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# Error")
            );
            container.addSeparatorComponents(new SeparatorBuilder());
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("❌ | An error occurred while updating the prefix.")
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(
                            message.guild.iconURL({ format: "png", dynamic: true, size: 1024 }) ||
                            "https://cdn.discordapp.com/embed/avatars/1.png"
                        )
                    )
            );

            return message.channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        }
    }
};