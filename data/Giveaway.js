const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  channelId: { type: String, required: true },
  guildId: { type: String, required: true },
  prize: { type: String, required: true },
  winners: { type: Number, required: true },
  endTime: { type: Number, required: true },
  host: { type: String, required: true },
  ended: { type: Boolean, default: false }
});

module.exports = mongoose.model("Giveaway", giveawaySchema);