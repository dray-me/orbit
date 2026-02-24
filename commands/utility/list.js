const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// Define the emojis at the top
const tick = "<:tick:1343079179641557053>";
const cross = "<:info:1355153278060593154>";
const boosterEmoji = "<a:boost:1343247733141799094>";

module.exports = {
    name: "list",
    description: "Lists various server information",
    async execute(message, args) {
        const createErrorEmbed = (description) => {
            return new EmbedBuilder()
                .setColor(0x000000)
                .setDescription(`${cross} ${description}`)
                .setFooter({ text: "Stratos Development" });
        };

        if (!args[0]) {
            return message.reply({
                embeds: [
                    createErrorEmbed("Please specify a valid option: `boosters`, `bans`, `emojis`, `roles`, `bots`")
                ]
            });
        }

        const type = args[0].toLowerCase();
        let items = [];
        let title = "";
        let color = 0x000000;

        try {
            switch (type) {
                case "boosters":
                case "boost":
                    const boosters = message.guild.members.cache.filter(m => m.premiumSince);
                    if (boosters.size === 0) {
                        return message.reply({
                            embeds: [
                                createErrorEmbed("This server has no boosters.")
                            ]
                        });
                    }
                    
                    title = `${boosterEmoji} Boosters in ${message.guild.name} [${boosters.size}]`;
                    items = Array.from(boosters.values()).map((booster, index) => 
                        `\`#${index + 1}.\` [${booster.user.tag}](https://discord.com/users/${booster.id}) [${booster}] - <t:${Math.floor(booster.premiumSinceTimestamp / 1000)}:R>`
                    );
                    break;

                case "bans":
                case "ban":
                    const bans = await message.guild.bans.fetch();
                    if (bans.size === 0) {
                        return message.reply({
                            embeds: [
                                createErrorEmbed("No banned users found in this server.")
                            ]
                        });
                    }
                    
                    title = `<:bans:1355153276126888027> Banned Users in ${message.guild.name} [${bans.size}]`;
                    items = Array.from(bans.values()).map((ban, index) => 
                        `\`#${index + 1}.\` ${ban.user.tag} (${ban.user.id}) - Reason: ${ban.reason || "No reason provided"}`
                    );
                    break;

                case "emojis":
                case "emoji":
                    const emojis = message.guild.emojis.cache;
                    if (emojis.size === 0) {
                        return message.reply({
                            embeds: [
                                createErrorEmbed("No emojis found in this server.")
                            ]
                        });
                    }
                    
                    title = `<:emojis:1355153246561239210> Emojis in ${message.guild.name} [${emojis.size}]`;
                    items = Array.from(emojis.values()).map((emoji, index) => 
                        `\`#${index + 1}.\` ${emoji} - \`<${emoji.animated ? 'a' : ''}:${emoji.name}:${emoji.id}>\``
                    );
                    break;

                case "roles":
                case "role":
                    const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position);
                    if (roles.size === 0) {
                        return message.reply({
                            embeds: [
                                createErrorEmbed("No roles found in this server.")
                            ]
                        });
                    }
                    
                    title = `<:roles:1355153252609556610> Roles in ${message.guild.name} [${roles.size}]`;
                    items = Array.from(roles.values()).map((role, index) => 
                        `\`#${index + 1}.\` ${role} - \`[${role.id}]\``
                    );
                    break;

                case "bots":
                case "bot":
                    await message.guild.members.fetch();
                    const bots = message.guild.members.cache.filter(m => m.user.bot);
                    if (bots.size === 0) {
                        return message.reply({
                            embeds: [
                                createErrorEmbed("No bots found in this server.")
                            ]
                        });
                    }
                    
                    title = `<:bots_:1355153256929820762> Bots in ${message.guild.name} [${bots.size}]`;
                    items = Array.from(bots.values()).map((bot, index) => 
                        `\`#${index + 1}.\` [${bot.user.tag}](https://discord.com/users/${bot.id}) [${bot}]`
                    );
                    break;

                default:
                    return message.reply({
                        embeds: [
                            createErrorEmbed("Invalid option! Use: `boosters`, `bans`, `emojis`, `roles`, or `bots`")
                        ]
                    });
            }

            // Pagination
            let currentPage = 0;
            const perPage = 10;
            const totalPages = Math.ceil(items.length / perPage);

            const generateEmbed = () => {
                const start = currentPage * perPage;
                const end = start + perPage;
                return new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(items.slice(start, end).join("\n") || "No items to display")
                    .setColor(color)
                    .setFooter({ text: `Page ${currentPage + 1}/${totalPages} | Stratos Development` });
            };

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("◀")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 0),
                new ButtonBuilder()
                    .setCustomId("delete")
                    .setLabel("🗑️ Delete")
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("▶")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage >= totalPages - 1)
            );

            const response = await message.reply({ 
                embeds: [generateEmbed()], 
                components: [buttons] 
            });

            const collector = response.createMessageComponentCollector({ 
                filter: i => i.user.id === message.author.id, 
                time: 60000 
            });

            collector.on("collect", async interaction => {
                if (interaction.customId === "prev") {
                    currentPage--;
                } else if (interaction.customId === "next") {
                    currentPage++;
                } else if (interaction.customId === "delete") {
                    await response.delete();
                    return;
                }

                buttons.components[0].setDisabled(currentPage === 0);
                buttons.components[2].setDisabled(currentPage >= totalPages - 1);

                await interaction.update({ 
                    embeds: [generateEmbed()], 
                    components: [buttons] 
                });
            });

            collector.on("end", () => {
                if (!response.deleted) {
                    response.edit({ components: [] }).catch(() => {});
                }
            });

        } catch (error) {
            console.error("List command error:", error);
            message.reply({ 
                embeds: [
                    createErrorEmbed("An error occurred while processing your request.")
                ] 
            }).catch(() => {});
        }
    }
};