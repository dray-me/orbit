const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'banner',
    description: 'Get a user\'s banner in Rebiton™ style',
    usage: '!banner [@user|userID]',
    async execute(message, args) {
        let targetUser;

        if (args.length > 0) {
            const mention = args[0].match(/^<@!?(\d+)>$/);
            const userId = mention ? mention[1] : args[0];
            try {
                targetUser = await message.client.users.fetch(userId);
            } catch {
                return message.reply('Could not find that user.');
            }
        } else {
            targetUser = message.author;
        }

        try {
            const user = await message.client.users.fetch(targetUser.id, { force: true });
            const bannerURL = user.bannerURL({ size: 4096, dynamic: true });

            if (!bannerURL) {
                const noBannerEmbed = new EmbedBuilder()
                    .setColor('#2B2D31')
                    .setDescription(`<@${targetUser.id}> doesn't have a banner set`);
                return message.channel.send({ embeds: [noBannerEmbed] });
            }

            const embed = new EmbedBuilder()
                .setColor('#2B2D31')
                .setAuthor({
                    name: `Stratos's banner`,
                    iconURL: targetUser.displayAvatarURL()
                })
                .setDescription(`[PNG](${bannerURL}) | [JPG](${bannerURL}) | [WEBP](${bannerURL})`)
                .setImage(bannerURL)
                .setFooter({
                    text: `Requested by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                });

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('There was an error fetching the banner.');
            message.channel.send({ embeds: [errorEmbed] });
        }
    },
};