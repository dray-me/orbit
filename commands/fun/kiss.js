const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'kiss',
    description: 'Kiss someone!',
    
    run: async (message, args, client) => {
        const target = message.mentions.users.first();
        if (!target) return message.reply('❌ | Please mention someone to kiss!');

        try {
            const response = await axios.get('https://api.waifu.pics/sfw/kiss');
            const gifUrl = response.data.url;

            const embed = new EmbedBuilder()
                .setColor('#FF1493')
                .setDescription(`💋 **${message.author} kissed ${target}!**`)
                .setImage(gifUrl)
                .setFooter({ text: 'How romantic! ❤️' });

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply('❌ | Failed to fetch a GIF. Try again!');
        }
    }
};