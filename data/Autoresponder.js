const mongoose = require("mongoose");

const AutoResponderSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    trigger: { type: String, required: true },
    response: { type: String, default: null }
});

module.exports = mongoose.model("Autoresponder", AutoResponderSchema);