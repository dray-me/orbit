const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require('discord.js');
const axios = require('axios');

module.exports = {
  name: 'steal',
  description: 'Steal emojis or stickers from other servers',
  aliases: ['eadd'],
  usage: '[emoji] or reply to a message with attachments/stickers/emojis',
  permissions: [PermissionFlagsBits.ManageEmojisAndStickers],
  cooldown: 3,
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageEmojisAndStickers)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ You need `Manage Emojis & Stickers` permission to use this!")
            .setColor(0x2f3136)
        ]
      });
    }

    if (message.reference) {
      const refMessage = await message.channel.messages.fetch(message.reference.messageId);
      const attachments = refMessage.attachments;
      const stickers = refMessage.stickers;
      const emojis = refMessage.content.match(/<a?:.+?:\d+>/g) || [];

      if (attachments.size > 0 || stickers.size > 0 || emojis.length > 0) {
        return createButtons(message, attachments, stickers, emojis);
      }
    }

    if (args[0]) {
      return processEmoji(message, args[0]);
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Steal")
          .setDescription("No emoji or sticker found")
          .setColor(0x2f3136)
      ]
    });
  }
};

async function processEmoji(message, emote) {
  try {
    const emojiRegex = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
    const match = emote.match(emojiRegex);

    if (!match) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Steal")
            .setDescription("Invalid emoji format")
            .setColor(0x2f3136)
        ]
      });
    }

    const [, animated, name, emojiId] = match;
    const url = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}`;
    await addEmoji(message, url, name, !!animated);
  } catch (error) {
    console.error(error);
    message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Steal")
          .setDescription(`Failed to add emoji: ${error.message}`)
          .setColor(0x2f3136)
      ]
    });
  }
}

async function addEmoji(message, url, name, animated) {
  try {
    if (!hasEmojiSlot(message.guild, animated)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Steal")
            .setDescription("No more emoji slots available")
            .setColor(0x2f3136)
        ]
      });
    }

    const sanitizedName = sanitizeName(name);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const emoji = await message.guild.emojis.create({
      attachment: response.data,
      name: sanitizedName
    });

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Steal")
          .setDescription(`Added emoji **${emoji}**!`)
          .setColor(0x2f3136)
      ]
    });
  } catch (error) {
    console.error(error);
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Steal")
          .setDescription(`Failed to add emoji: ${error.message}`)
          .setColor(0x2f3136)
      ]
    });
  }
}

async function addSticker(message, url, name) {
  try {
    if (message.guild.stickers.cache.size >= getMaxStickerCount(message.guild)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Steal")
            .setDescription("No more sticker slots available")
            .setColor(0x2f3136)
        ]
      });
    }

    const sanitizedName = sanitizeName(name);
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    await message.guild.stickers.create({
      file: Buffer.from(response.data),
      name: sanitizedName,
      description: "Added by bot",
      tags: "stolen"
    });

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Steal")
          .setDescription(`Added sticker **${sanitizedName}**!`)
          .setColor(0x2f3136)
      ]
    });
  } catch (error) {
    console.error(error);
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Steal")
          .setDescription(`Failed to add sticker: ${error.message}`)
          .setColor(0x2f3136)
      ]
    });
  }
}

function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 32);
}

function hasEmojiSlot(guild, animated) {
  const normalEmojis = guild.emojis.cache.filter(e => !e.animated).size;
  const animatedEmojis = guild.emojis.cache.filter(e => e.animated).size;
  const [maxNormal, maxAnimated] = getMaxEmojiCount(guild);
  return animated ? animatedEmojis < maxAnimated : normalEmojis < maxNormal;
}

function getMaxEmojiCount(guild) {
  switch (guild.premiumTier) {
    case 'TIER_3': return [250, 250];
    case 'TIER_2': return [150, 150];
    case 'TIER_1': return [100, 100];
    default: return [50, 50];
  }
}

function getMaxStickerCount(guild) {
  switch (guild.premiumTier) {
    case 'TIER_3': return 60;
    case 'TIER_2': return 30;
    case 'TIER_1': return 15;
    default: return 5;
  }
}

async function createButtons(message, attachments, stickers, emojis) {
  const embed = new EmbedBuilder()
    .setDescription("Choose what to steal:")
    .setColor(0x2f3136);

  if (attachments.size > 0) {
    embed.setImage(attachments.first().url);
  } else if (stickers.size > 0) {
    embed.setImage(stickers.first().url);
  } else if (emojis.length > 0) {
    const emojiId = emojis[0].match(/:(\d+)>/)[1];
    embed.setImage(`https://cdn.discordapp.com/emojis/${emojiId}.png`);
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('steal_emoji')
      .setLabel('Steal as Emoji')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('steal_sticker')
      .setLabel('Steal as Sticker')
      .setStyle(ButtonStyle.Success)
  );

  const reply = await message.reply({ embeds: [embed], components: [row] });

  const collector = reply.createMessageComponentCollector({ time: 15000 });

  collector.on('collect', async interaction => {
    if (interaction.user.id !== message.author.id) {
      return interaction.reply({ content: "This interaction is not for you.", ephemeral: true });
    }

    await interaction.deferUpdate();

    try {
      if (interaction.customId === 'steal_emoji') {
        for (const sticker of stickers.values()) {
          const animated = sticker.format === 'APNG';
          await addEmoji(message, sticker.url, sticker.name.replace(' ', '_'), animated);
        }
        for (const attachment of attachments.values()) {
          await addEmoji(message, attachment.url, attachment.name.split('.')[0].replace(' ', '_'), false);
        }
        for (const emote of emojis) {
          await processEmoji(message, emote);
        }
      } else if (interaction.customId === 'steal_sticker') {
        for (const sticker of stickers.values()) {
          await addSticker(message, sticker.url, sticker.name);
        }
        for (const attachment of attachments.values()) {
          await addSticker(message, attachment.url, attachment.name.split('.')[0]);
        }
        for (const emote of emojis) {
          const name = emote.split(':')[1];
          const emojiId = emote.split(':')[2].replace('>', '');
          const url = `https://cdn.discordapp.com/emojis/${emojiId}.png`;
          await addSticker(message, url, name);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  collector.on('end', () => {
    reply.edit({ components: [] }).catch(console.error);
  });
}