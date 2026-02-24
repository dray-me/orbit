const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
} = require("discord.js");

module.exports = {
    name: "nuke",
    aliases: ["boom"],
    description: "Deletes and clones the current channel",
    usage: "!nuke",

    async execute(message, args) {
        try {
            // Permission check for the user
            if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return message.reply({
                    content: "❌ You don't have permission to nuke channels!",
                });
            }

            // Permission check for the bot
            if (!message.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
                return message.reply({
                    content: "❌ I don't have permission to manage channels!",
                });
            }

            // Confirmation embed
            const confirmEmbed = new EmbedBuilder()
                .setTitle("⚠️ Nuke Confirmation")
                .setDescription(
                    `Are you sure you want to nuke this channel?\nThis will delete and recreate it.`
                )
                .setColor("Red");

            // Buttons (Components v2 style)
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("confirm_nuke")
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("cancel_nuke")
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Secondary)
            );

            const msg = await message.reply({
                embeds: [confirmEmbed],
                components: [row],
            });

            // Collector for button interaction
            const collector = msg.createMessageComponentCollector({
                filter: (i) => i.user.id === message.author.id,
                time: 15000,
            });

            collector.on("collect", async (interaction) => {
                if (interaction.customId === "confirm_nuke") {
                    await interaction.deferUpdate();

                    const position = message.channel.position;
                    const newChannel = await message.channel.clone();
                    await message.channel.delete();
                    await newChannel.setPosition(position);

                    return newChannel.send("💣 This channel has been nuked!");
                }

                if (interaction.customId === "cancel_nuke") {
                    await interaction.update({
                        content: "❌ Nuke cancelled.",
                        embeds: [],
                        components: [],
                    });
                }
            });

            collector.on("end", async (collected) => {
                if (collected.size === 0) {
                    await msg.edit({
                        content: "⌛ Nuke confirmation timed out.",
                        embeds: [],
                        components: [],
                    });
                }
            });
        } catch (err) {
            console.error("Nuke Command Error:", err);
            return message.reply("❌ An error occurred while trying to nuke the channel.");
        }
    },
};