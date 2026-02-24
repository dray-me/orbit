const { EmbedBuilder } = require("discord.js");
const NoPrefix = require("../../data/Noprefix");
const ms = require("ms");
const config = require("../../config.json");

module.exports = {
  name: "noprefix",
  aliases: ["np"],
  description: "Manage NoPrefix access",
  async execute(message, args) {
    if (message.author.id !== config.ownerID) return;

    const sub = args[0];
    const userArg = args[1];
    const user = userArg ? message.mentions.users.first() || await message.client.users.fetch(userArg).catch(() => null) : null;

    if (!sub || !["add", "remove", "reset", "list"].includes(sub)) {
      return message.reply("Usage:\n`np add <user> <duration>`\n`np remove <user>`\n`np reset`\n`np list`");
    }

    if (["add", "remove"].includes(sub) && !user) {
      return message.reply("Please mention a valid user or provide a valid user ID.");
    }

    if (sub === "add") {
      const duration = args[2];
      if (!duration) return message.reply("Specify a duration (e.g., 10m, 1d, 30d, perm)");

      const expiresAt = duration === "perm" ? null : new Date(Date.now() + ms(duration));
      await NoPrefix.findOneAndUpdate(
        { userId: user.id },
        { userId: user.id, expiresAt, warned: false },
        { upsert: true }
      );

      message.reply(`✅ NoPrefix granted to **${user.tag}** for **${duration === "perm" ? "Permanent" : duration}**.`);

      try {
        await user.send(`✅ You have been granted NoPrefix access for **${duration === "perm" ? "Permanent" : duration}**.`);
      } catch {}
    }

    if (sub === "remove") {
      const doc = await NoPrefix.findOneAndDelete({ userId: user.id });
      if (!doc) return message.reply("That user does not have NoPrefix access.");
      message.reply(`❌ NoPrefix access removed from **${user.tag}**.`);
    }

    if (sub === "reset") {
      await NoPrefix.deleteMany({});
      message.reply("🔄 All NoPrefix data has been reset.");
    }

    if (sub === "list") {
      const docs = await NoPrefix.find();
      if (!docs.length) return message.reply("No users currently have NoPrefix access.");

      const list = docs.map(doc => {
        const duration = doc.expiresAt ? `<t:${Math.floor(doc.expiresAt.getTime() / 1000)}:R>` : "Permanent";
        return `• <@${doc.userId}> — ${duration}`;
      }).join("\n");

      const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle("NoPrefix Access List")
        .setDescription(list);

      message.reply({ embeds: [embed] });
    }
  }
};