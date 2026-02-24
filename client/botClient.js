const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const config = require("../config.json");
const logger = require("../utils/logger");
const commandHandler = require("../handlers/commandHandler");
const eventHandler = require("../handlers/eventHandler");
const fs = require("fs");

// Initialize client with all intents and allowed mentions configuration
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  allowedMentions: {
    repliedUser: false,
    parse: ['users', 'roles'],
  },
});

// Initialize collections
client.commands = new Collection();
client.prefixes = {};

// Load Prefixes JSON
function loadPrefixes() {
  try {
    if (fs.existsSync("prefixes.json")) {
      return JSON.parse(fs.readFileSync("prefixes.json", "utf8"));
    }
    return {};
  } catch (error) {
    logger.error("❌ Error reading prefixes.json:", error);
    return {};
  }
}

// Save Prefixes JSON
function savePrefixes(prefixes) {
  try {
    fs.writeFileSync("prefixes.json", JSON.stringify(prefixes, null, 2));
  } catch (error) {
    logger.error("❌ Error saving prefixes.json:", error);
  }
}

// Prefix management
client.getPrefix = (guildId) => client.prefixes[guildId] || config.defaultPrefix;
client.prefixes = loadPrefixes();
client.savePrefixes = savePrefixes;

// Load handlers
const commandCount = commandHandler(client);
const eventCount = eventHandler(client);

// Ready Event
client.once("ready", () => {
  logger.success(`✅ Logged in as ${client.user.tag}`);
  logger.info(`📝 Default prefix set to: "${config.defaultPrefix}"`);
  logger.info(`🛠️ Loaded ${commandCount} commands`);
  logger.info(`🎉 Loaded ${eventCount} events`);

  // Set bot presence
  client.user.setPresence({
    status: config.activity.status,
    activities: [{
      name: config.activity.name,
      type: ActivityType[config.activity.type]
    }]
  });

  // Load additional handlers
  try {
    require("../events/giveawayHandler")(client);
    logger.debug("🎁 Giveaway handler loaded");
  } catch (error) {
    logger.error("❌ Error loading giveaway handler:", error);
  }
});

module.exports = client;
