const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    enabled: { type: Boolean, default: false },
    hiddenChannels: { type: [String], default: [] }
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);