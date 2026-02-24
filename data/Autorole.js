const mongoose = require("mongoose");

const autoroleSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    humanRoles: { type: [String], default: [] },
    botRoles: { type: [String], default: [] }
});

module.exports = mongoose.model("Autorole", autoroleSchema);