// data/Noprefix.js
const mongoose = require("mongoose");

const noprefixSchema = new mongoose.Schema({
  userId: String,
  expiresAt: Date,
  warned: { type: Boolean, default: false }
});

module.exports = mongoose.model("NoPrefix", noprefixSchema);