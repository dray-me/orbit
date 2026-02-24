const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const ms = require("ms");
const Giveaway = require("../../data/Giveaway");

module.exports = {
  name: "gstart",
  description: "Start a giveaway",

  async execute(message, args, client) {
    const duration = args[0];
    const winnersCount = parseInt(args[1]);
    const prize = args.slice(2).join(" ");

    if (!duration || !winnersCount || !prize) {
      return message.reply(
        "⚠️ Usage: `-gstart <time> <winners> <prize>`\nExample: `-gstart 1m 1 Nitro Classic`"
      );
    }

    const endTime = Date.now() + ms(duration);

    const embed = new EmbedBuilder()
      .setDescription(
        `**Prize:** ${prize}\n\n` +
        `<:dot:1401643018993537156> Winners: **${winnersCount}**\n` +
        `<:dot:1401643018993537156> Ends: <t:${Math.floor(endTime / 1000)}:R>\n` +
        `<:dot:1401643018993537156> Hosted by: <@${message.author.id}>\n\n` +
        `React with 🎉 to participate!`
      )
      .setFooter({ text: `Ends at | ${new Date(endTime).toLocaleString()}` })
      .setColor("#EEEEEE")
      .setTimestamp(endTime);

    const giveawayMsg = await message.channel.send({ content: "<:giveaway:1401643021371703387> **New Giveaway** <:giveaway:1401643021371703387>", embeds: [embed] });
    await giveawayMsg.react("🎉");

    await Giveaway.create({
      messageId: giveawayMsg.id,
      channelId: message.channel.id,
      guildId: message.guild.id,
      prize,
      winners: winnersCount,
      endTime,
      host: message.author.id,
      ended: false,
    });
      

    // End giveaway after duration
    setTimeout(async () => {
      try {
        const fetchedMsg = await message.channel.messages.fetch(giveawayMsg.id);
        const reaction = fetchedMsg.reactions.cache.get("🎉");
        const users = reaction ? await reaction.users.fetch() : [];

        const participants = users.filter(u => !u.bot).map(u => u.id);

        let winners = [];
        if (participants.length > 0) {
          for (let i = 0; i < winnersCount && participants.length > 0; i++) {
            const index = Math.floor(Math.random() * participants.length);
            winners.push(participants[index]);
            participants.splice(index, 1);
          }
        }

        // Update embed
        const endedEmbed = EmbedBuilder.from(embed)
          .setDescription(
            `**Prize:** ${prize}\n\n` +
            `<:dot:1401643018993537156> Hosted by: <@!${message.author.id}>\n` +
            `<:dot:1401643018993537156> Total participants: ${users.size - 1}\n\n` +
            `<:dot:1401643018993537156> Winner(s): ${
              winners.length > 0 ? winners.map(id => `<@${id}>`).join(", ") : "No valid entries."
            }`
          );

        await fetchedMsg.edit({ content: "🎉 **Giveaway Ended** 🎉", embeds: [endedEmbed] });
        await Giveaway.updateOne({ messageId: giveawayMsg.id }, { ended: true });

        if (winners.length > 0) {
          // ✅ Create buttons
          const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Giveaway Link")
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${giveawayMsg.id}`),
            new ButtonBuilder()
              .setLabel("Invite Me")
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
          );

          message.channel.send({
            content: `Congrats, ${winners.map(id => `<@${id}>`).join(", ")} you have won **${prize}**, hosted by <@!${message.author.id}>`,
            components: [buttons]
          });
        } else {
          message.channel.send("No valid participants, giveaway canceled.");
        }
      } catch (err) {
        console.error("Error ending giveaway:", err);
      }
    }, ms(duration));
  },
};