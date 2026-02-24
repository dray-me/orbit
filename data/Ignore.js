const mongoose = require("mongoose");

const ignoreSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  ignoredChannels: { type: [String], default: [] },
  bypassRoles: { type: [String], default: [] },
});

module.exports = mongoose.model("Ignore", ignoreSchema);