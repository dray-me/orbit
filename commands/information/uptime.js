const {
    ContainerBuilder,
    TextDisplayBuilder,
    SectionBuilder
} = require('discord.js');

module.exports = {
    name: 'uptime',
    description: 'Shows the bot\'s uptime in relative time format.',
    execute(message) {
        const startTime = Date.now() - message.client.uptime;
        const unixTimestamp = Math.floor(startTime / 1000);
        
        const container = new ContainerBuilder()
            .setAccentColor(0x00FFAA)
            .addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# Uptime`),
                        new TextDisplayBuilder().setContent(`I am online since <t:${unixTimestamp}:R>`)
                    )
            );

        message.channel.send({ 
            components: [container] 
        });
    }
};