const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const Autorole = require("../../data/Autorole");

module.exports = {
    name: "autorole",
    description: "Manage automatic role assignment for humans and bots",
    usage: "autorole <humans|bots> <add|remove|list|reset> [role]",
    category: "welcome",
    aliases: ["ar"],
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Red")
                        .setDescription("❌ You don't have permission to manage roles.")
                ]
            });
        }

        if (!args[0] || !["humans", "bots"].includes(args[0])) {
            return sendUsage(message);
        }

        const type = args[0] === "humans" ? "humanRoles" : "botRoles";
        let data = await Autorole.findOne({ guildId: message.guild.id });
        if (!data) {
            data = await Autorole.create({ guildId: message.guild.id });
        }

        const subcmd = args[1];

        // ADD role
        if (subcmd === "add") {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
            if (!role) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setDescription("❌ Please mention a valid role or provide its ID.")
                    ]
                });
            }

            if (data[type].includes(role.id)) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Yellow")
                            .setDescription(`⚠ The role ${role} is already in the list.`)
                    ]
                });
            }

            data[type].push(role.id);
            await data.save();

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setDescription(`✅ Added ${role} to ${args[0]} autoroles.`)
                ]
            });
        }

        // REMOVE role
        if (subcmd === "remove") {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[2]);
            if (!role) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setDescription("❌ Please mention a valid role or provide its ID.")
                    ]
                });
            }

            if (!data[type].includes(role.id)) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Yellow")
                            .setDescription(`⚠ The role ${role} is not in the list.`)
                    ]
                });
            }

            data[type] = data[type].filter(r => r !== role.id);
            await data.save();

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setDescription(`✅ Removed ${role} from ${args[0]} autoroles.`)
                ]
            });
        }

        // LIST roles
        if (subcmd === "list") {
            const roles = data[type].map(r => `<@&${r}>`).join(", ") || "None";
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle(`📜 ${args[0]} AutoRoles`)
                        .setDescription(roles)
                ]
            });
        }

        // RESET roles
        if (subcmd === "reset") {
            data[type] = [];
            await data.save();

            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor("Green")
                        .setDescription(`✅ Reset ${args[0]} autoroles.`)
                ]
            });
        }

        return sendUsage(message);
    }
};

function sendUsage(message) {
    return message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor("Orange")
                .setTitle("⚙ Autorole Command Usage")
                .setDescription(
                    "`autorole humans add <role>`\n" +
                    "`autorole humans remove <role>`\n" +
                    "`autorole humans list`\n" +
                    "`autorole humans reset`\n\n" +
                    "`autorole bots add <role>`\n" +
                    "`autorole bots remove <role>`\n" +
                    "`autorole bots list`\n" +
                    "`autorole bots reset`"
                )
        ]
    });
}