const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "mc",
    aliases: ["membercount"],
    description: "Shows the total number of members in the server",
    execute(message) {
        const { guild, author, client } = message;
        const memberCount = guild.memberCount;
        
        // 24-hour time format
        const currentTime = new Date();
        const hours = currentTime.getHours().toString().padStart(2, "0");
        const minutes = currentTime.getMinutes().toString().padStart(2, "0");
        const timeString = `${hours}:${minutes}`;

        const embed = new EmbedBuilder()
            .setAuthor({ name: author.tag, iconURL: author.displayAvatarURL({ dynamic: true }) })
            .setTitle("Total Members")
            .setDescription(`**${memberCount} Members**`)
            .setColor("Blue")
            .setFooter({ text: `Today at ${timeString}`, iconURL: client.user.displayAvatarURL() });

        message.channel.send({ embeds: [embed] });
    }
};