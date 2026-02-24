const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'hug',
    description: 'Give a warm hug!',
    
    run: async (message, args, client) => {
        const target = message.mentions.users.first();
        if (!target) return message.reply('❌ | Please mention someone to hug!');

        try {
            const response = await axios.get('https://api.waifu.pics/sfw/hug');
            const gifUrl = response.data.url;

            const embed = new EmbedBuilder()
                .setColor('#FFC300')
                .setDescription(`🤗 **${message.author} hugged ${target}!**`)
                .setImage(gifUrl)
                .setFooter({ text: 'Awww! That’s so sweet! ❤️' });

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            message.reply('❌ | Failed to fetch a GIF. Try again!');
        }
    }
};