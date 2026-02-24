const { EmbedBuilder } = require("discord.js");
const AutoResponder = require("../../data/Autoresponder");

module.exports = {
    name: "autoresponder",
    aliases: ["a"],
    async execute(message, args) {
        if (!args.length) {
            return message.channel.send({ embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setDescription("❌ Usage: `autoresponder <create|delete|edit|list|reset>`")
            ]});
        }

        const sub = args.shift().toLowerCase();

        if (sub === "create") {
            const trigger = args.shift();
            const response = args.join(" ");
            if (!trigger || !response) return message.channel.send({ embeds: [
                new EmbedBuilder().setColor("Red").setDescription("❌ Usage: `autoresponder create <trigger> <response>`")
            ]});

            let data = await AutoResponder.findOne({ guildId: message.guild.id, trigger });
            if (data) return message.channel.send({ embeds: [
                new EmbedBuilder().setColor("Red").setDescription("❌ This trigger already exists!")
            ]});

            data = new AutoResponder({ guildId: message.guild.id, trigger, response });
            await data.save();

            return message.channel.send({ embeds: [
                new EmbedBuilder().setColor("Green").setDescription(`✅ Added autoresponder for \`${trigger}\``)
            ]});
        }

        if (sub === "delete") {
            const trigger = args[0];
            if (!trigger) return message.channel.send({ embeds: [
                new EmbedBuilder().setColor("Red").setDescription("❌ Usage: `autoresponder delete <trigger>`")
            ]});

            const res = await AutoResponder.findOneAndDelete({ guildId: message.guild.id, trigger });
            if (!res) return message.channel.send({ embeds: [
                new EmbedBuilder().setColor("Red").setDescription("❌ No such trigger found.")
            ]});

            return message.channel.send({ embeds: [
                new EmbedBuilder().setColor("Green").setDescription(`✅ Deleted autoresponder for \`${trigger}\``)
            ]});
        }

        if (sub === "edit") {
            const trigger = args.shift();
            const newResponse = args.join(" ");
            if (!trigger || !newResponse) return message.channel.send({ embeds: [
                new EmbedBuilder().setColor("Red").setDescription("❌ Usage: `autoresponder edit <trigger> <new response>`")
            ]});

            const res = await AutoResponder.findOneAndUpdate(
                { guildId: message.guild.id, trigger },
                { response: newResponse }
            );
            if (!res) return message.channel.send({ embeds: [
                new EmbedBuilder().setColor("Red").setDescription("❌ No such trigger found.")
            ]});

            return message.channel.send({ embeds: [
                new EmbedBuilder().setColor("Green").setDescription(`✅ Updated autoresponder for \`${trigger}\``)
            ]});
        }

        if (sub === "list") {
            const data = await AutoResponder.find({ guildId: message.guild.id });
            if (!data.length) return message.channel.send({ embeds: [
                new EmbedBuilder().setColor("Red").setDescription("❌ No autoresponders found.")
            ]});

            return message.channel.send({ embeds: [
                new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("Autoresponder List")
                    .setDescription(data.map(d => `**${d.trigger}** → ${d.response}`).join("\n"))
            ]});
        }

        if (sub === "reset") {
            const res = await AutoResponder.deleteMany({ guildId: message.guild.id });
            return message.channel.send({ embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setDescription(`✅ Reset complete. Deleted \`${res.deletedCount}\` autoresponders.`)
            ]});
        }
    }
};