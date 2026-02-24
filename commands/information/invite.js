const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'invite',
    description: 'Get the invite link for the bot!',
    execute(message) {
        const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${message.client.user.id}&permissions=8&scope=bot`;
        const supportServer = 'https://discord.gg/5ZJ9TVNafR';
        const websiteLink = 'https://your-website-url.com'; // Replace with your website

        const inviteEmbed = new EmbedBuilder()
            .setColor('#00FFAA')
            .setAuthor({ 
                name: `${message.client.user.tag}`, 
                iconURL: message.client.user.displayAvatarURL(),
                url: websiteLink 
            })
            .setDescription(`**Invite me to your server!**\nOr join my support server for help!`)
            .addFields(
                { name: 'Support Server', value: `[Click here](${supportServer})`, inline: true },
                { name: 'Website', value: `[Visit here](${websiteLink})`, inline: true }
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Invite Me')
                    .setURL(inviteLink)
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Support Server')
                    .setURL(supportServer)
                    .setStyle(ButtonStyle.Link),
                new ButtonBuilder()
                    .setLabel('Website')
                    .setURL(websiteLink)
                    .setStyle(ButtonStyle.Link)
            );

        message.channel.send({ 
            embeds: [inviteEmbed],
            components: [row] 
        });
    }
};