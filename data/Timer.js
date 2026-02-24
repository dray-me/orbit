const mongoose = require("mongoose");

const timerSchema = new mongoose.Schema({
  guildId: String,
  messageId: String,
  channelId: String,
  endTime: Number,
  paused: { type: Boolean, default: false },
  remaining: Number,
  userMessage: String,
});

module.exports = mongoose.model("Timer", timerSchema);