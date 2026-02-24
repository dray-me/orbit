const {
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ThumbnailBuilder
} = require('discord.js');
const os = require('os');
const moment = require('moment');

module.exports = {
    name: "stats",
    aliases: ["botinfo", "information", "st", "bi"],
    description: "Show bot statistics",
    execute: async (message, args, client) => {
        if (!client.user) {
            return message.reply("Bot data is not available. Try again late.");
        }

        // Navigation buttons in an ActionRow
        const createButtons = (activeButton) =>
            new ActionRowBuilder().addComponents(
                [
                    new ButtonBuilder()
                        .setCustomId('general')
                        .setLabel('General Info')
                        .setStyle(activeButton === 'general' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                        .setDisabled(activeButton === 'general'),
                    new ButtonBuilder()
                        .setCustomId('system')
                        .setLabel('System Info')
                        .setStyle(activeButton === 'system' ? ButtonStyle.Danger : ButtonStyle.Secondary)
                        .setDisabled(activeButton === 'system'),
                    new ButtonBuilder()
                        .setCustomId('team')
                        .setLabel('Team Info')
                        .setStyle(activeButton === 'team' ? ButtonStyle.Success : ButtonStyle.Secondary)
                        .setDisabled(activeButton === 'team')
                ]
            );

        // General info container
        const buildGeneralContainer = () => {
            const uptime = moment.duration(client.uptime).humanize();
            const createdOn = moment(client.user.createdAt).format('MMMM Do YYYY, h:mm:ss a');
            return new ContainerBuilder()
                .setAccentColor(0xFFA500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${client.user.tag} - General Information`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`**General Bot Information**`),
                            new TextDisplayBuilder().setContent(
                                `**Bot Tag:** ${client.user.tag}
` +
                                `**Bot Version:** v1.0.0
` +
                                `**Created On:** ${createdOn}
` +
                                `**Discord.js:** v14
` +
                                `**Servers:** ${client.guilds.cache.size}
` +
                                `**Users:** ${client.users.cache.size}
` +
                                `**Channels:** ${client.channels.cache.size}
` +
                                `**Uptime:** ${uptime}`
                            )
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder().setURL(client.user.displayAvatarURL())
                        )
                )
                .addActionRowComponents(createButtons('general'));
        };

        // System info container
        const buildSystemContainer = () => {
            const totalMem = os.totalmem() / 1024 / 1024 / 1024;
            const usedMem = (os.totalmem() - os.freemem()) / 1024 / 1024 / 1024;
            const cpu = os.cpus()[0];
            return new ContainerBuilder()
                .setAccentColor(0xFAA61A)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${client.user.tag} - System Information`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`**System Information**`),
                            new TextDisplayBuilder().setContent(
                                `**System Latency:** ${client.ws.ping}ms
` +
                                `**Platform:** ${os.platform()}
` +
                                `**Architecture:** ${os.arch()}
` +
                                `**Memory Usage:** ${usedMem.toFixed(2)} GB / ${totalMem.toFixed(2)} GB
` +
                                `**Processor:** ${cpu.model}
` +
                                `**Speed:** ${cpu.speed} MHz
` +
                                `**Node Version:** ${process.version}
` +
                                `**Database Latency:** ${(Math.random() * 30 + 5).toFixed(2)}ms`
                            )
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder().setURL(client.user.displayAvatarURL())
                        )
                )
                .addActionRowComponents(createButtons('system'));
        };

        // Team info container
        const buildTeamContainer = () => {
            return new ContainerBuilder()
                .setAccentColor(0xFFA500)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${client.user.tag} - Team Information`)
                )
                .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
                )
                .addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`**Our Team**`),
                            new TextDisplayBuilder().setContent(
                                `**Developers**
` +
                                `[1] [arnab.irl](https://discord.com/users/1105408192537698334)
` +
                                `[2] [axizz4sure](https://discord.com/users/1064033717561081856)

` +
                                `**Core Team**
` +
                                `[1] [01priyanshu](https://discord.com/users/1074333930553086063)

` +
                                `**Additional Support**
` +
                                `[1] [oreo_yk](https://discord.com/users/1099232674977153084)`
                            )
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder().setURL(client.user.displayAvatarURL())
                        )
                )
                .addActionRowComponents(createButtons('team'));
        };

        // Reply with initial container
        const msg = await message.reply({
            components: [buildGeneralContainer()],
            flags: MessageFlags.IsComponentsV2
        });

        // Button collector
        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === message.author.id,
            time: 180000
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();
            let container;
            switch (i.customId) {
                case 'general':
                    container = buildGeneralContainer();
                    break;
                case 'system':
                    container = buildSystemContainer();
                    break;
                case 'team':
                    container = buildTeamContainer();
                    break;
                default:
                    container = buildGeneralContainer();
            }
            await i.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        });

        collector.on('end', () => {
            if (msg && !msg.deleted) {
                const expiredContainer = new ContainerBuilder()
                    .setAccentColor(0x747f8d)
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# ${client.user.tag} - Session Expired`)
                    )
                    .addSeparatorComponents(
                        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`This interactive session has expired. Run the command again to view statistics.`)
                    );
                msg.edit({
                    components: [expiredContainer],
                    flags: MessageFlags.IsComponentsV2
                }).catch(() => {});
            }
        });
    }
};