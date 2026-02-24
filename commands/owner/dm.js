const { EmbedBuilder } = require("discord.js");
const { ownerID } = require("../../config.json"); // Ensure ownerID is stored in config.json

module.exports = {
    name: "dm",
    aliases: [],
    description: "Send a secret message to a user or all members.",
    async execute(message, args) {
        if (message.author.id !== ownerID) return message.reply("❌ You are not authorized to use this command.");

        if (!args.length) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("❌ Error")
                        .setDescription("Please Type Something\n`dm @user <message>`\n`dm all <message>`")
                        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                ]
            });
        }

        let target = args[0].toLowerCase();
        let dmMessage = args.slice(1).join(" ");

        if (target === "all") {
            if (!dmMessage) return message.reply("❌ Please provide a message: `dm all <message>`");

            let members = message.guild.members.cache.filter(member => !member.user.bot);
            let successCount = 0, failCount = 0;

            members.forEach(member => {
                member.send({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
                            .setTitle("🔒 Secret Message For You")
                            .setDescription(dmMessage)
                            .setColor("Random")
                            .setFooter({ text: `Sent By ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    ]
                }).then(() => successCount++)
                  .catch(() => failCount++);
            });

            return message.channel.send(`✅ Message sent to ${successCount} members. ❌ Failed for ${failCount} members.`);
        }

        let user = message.mentions.users.first();
        if (!user) return message.reply("❌ Please mention a user: `dm @user <message>`");
        if (!dmMessage) return message.reply("❌ Please provide a message: `dm @user <message>`");

        user.send({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                    .setTitle("🔒 Secret Message For You")
                    .setDescription(dmMessage)
                    .setColor("Random")
                    .setFooter({ text: `Sent By ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
            ]
        }).then(() => {
            message.channel.send(`✅ Successfully sent a DM to **${user.tag}**.`);
        }).catch(() => {
            message.channel.send(`❌ Failed to send a DM to **${user.tag}**.`);
        });
    }
};