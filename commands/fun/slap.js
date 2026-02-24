const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'slap',
    description: 'Slap someone!',
    
    run: async (message, args, client) => {
        const target = message.mentions.users.first();
        if (!target) return message.reply('❌ | Please mention someone to slap!');

        try {
            const response = await axios.get('https://api.waifu.pics/sfw/slap');
            const gifUrl = response.data.url;

            const embed = new EmbedBuilder()
                .setColor('#FF5733')
                .setDescription(`💥 **${message.author} slapped ${target}!**`)
                .setImage(gifUrl)
                .setFooter({ text: 'Ouch! That must have hurt!' });

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply('❌ | Failed to fetch a GIF. Try again!');
        }
    }
};