const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { ownerID } = require('../../config.json'); // Load Owner ID from config

module.exports = {
    name: 'reload',
    aliases: ['rlcmd', 'reloadcmd', 'refresh'],
    description: 'Reloads all commands',

    run: async (message, args, client) => {
        // ✅ Owner Check
        if (message.author.id !== ownerID) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('<:cross:1362840470987870420> | You are not authorized to use this command.')
                ]
            });
        }

        // 🔄 Processing Embed
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setDescription('<a:Load:1363574418965790901> | **Reloading commands, please wait...**');

        const msg = await message.channel.send({ embeds: [embed] });

        try {
            // 🗑 Clear Command Cache
            client.commands.clear();

            // 📂 Reload Commands
            const commandFolders = fs.readdirSync('./commands');
            for (const folder of commandFolders) {
                const commandFiles = fs
                    .readdirSync(`./commands/${folder}`)
                    .filter(file => file.endsWith('.js'));

                for (const file of commandFiles) {
                    const filePath = path.join(__dirname, `../${folder}/${file}`);
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);
                    client.commands.set(command.name, command);
                }
            }

            // ✅ Success Embed Update
            embed
                .setColor('#00FF00')
                .setDescription('<:tick:1362840468668551198> | **All commands have been successfully reloaded.**');
            msg.edit({ embeds: [embed] });

        } catch (error) {
            console.error('Error reloading commands:', error);

            // ❌ Error Embed Update
            embed
                .setColor('#FF0000')
                .setDescription('<:cross:1362840470987870420> | An error occurred while reloading commands.');
            msg.edit({ embeds: [embed] });
        }
    }
};