const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    MessageFlags
} = require('discord.js');

const PingCommand = {
    name: 'ping',
    aliases: ['latency', 'ms', 'pong'],
    description: 'Shows comprehensive bot statistics including latency and uptime',

    async execute(message, args) {
        const client = message.client;
        try {
            console.log(`Ping command executed by ${message.author.username}`);

            // Create initial loading container
            const loadingContainer = new ContainerBuilder();

            loadingContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# Latency")
            );

            loadingContainer.addSeparatorComponents(new SeparatorBuilder());

            loadingContainer.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("> **Calculating latency statistics...**")
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(
                            client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
                        )
                    )
            );

            const sent = await message.reply({
                components: [loadingContainer],
                flags: MessageFlags.IsComponentsV2
            });

            // Calculate various latencies
            const messagePing = sent.createdTimestamp - message.createdTimestamp;
            const apiPing = Math.round(client.ws.ping);

            // Calculate uptime
            const uptime = client.uptime;
            const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

            let uptimeString = '';
            if (days > 0) uptimeString += `${days}d `;
            if (hours > 0) uptimeString += `${hours}h `;
            if (minutes > 0) uptimeString += `${minutes}m `;
            uptimeString += `${seconds}s`;

            // Determine latency quality
            let latencyStatus = '';
            if (apiPing < 100) {
                latencyStatus = 'Excellent';
            } else if (apiPing < 200) {
                latencyStatus = 'Good';
            } else if (apiPing < 300) {
                latencyStatus = 'Fair';
            } else {
                latencyStatus = 'Poor';
            }

            // Create final ping container
            const pingContainer = new ContainerBuilder();

            pingContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent("# Latency")
            );

            pingContainer.addSeparatorComponents(new SeparatorBuilder());

            const contentText = `> **Latency Information**\n` +
                `> **Latency:** \`${apiPing}ms\` (${latencyStatus})\n` +
                `> **Uptime:** \`${uptimeString}\`\n` +
                `> **Message Latency:** \`${messagePing}ms\`\n` +
                `> **API Latency:** \`${apiPing}ms\``;
            
            pingContainer.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(contentText),
                        new TextDisplayBuilder().setContent(`Requested by **${message.author.tag}**`)
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder().setURL(
                            client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
                        )
                    )
            );

            await sent.edit({
                components: [pingContainer],
                flags: MessageFlags.IsComponentsV2
            });

            console.log(`Ping stats - User: ${message.author.username}, API: ${apiPing}ms, Message: ${messagePing}ms`);

        } catch (error) {
            console.error('Error in ping command:', error);
            return PingCommand._sendError(message, "Error", "An error occurred while fetching ping statistics. Please try again in a moment.");
        }
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
                    new TextDisplayBuilder().setContent(`> ${description}`),
                    new TextDisplayBuilder().setContent(`> **Troubleshooting:** If this persists, contact bot administrators.`),
                    new TextDisplayBuilder().setContent(`Error reported by **${message.author.tag}**`)
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL(
                        message.client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })
                    )
                )
        );

        return message.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2
        });
    }
};

module.exports = PingCommand;