const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { defaultPrefix } = require('../../config.json');

module.exports = {
  name: 'help',
  aliases: ['h'],
  description: 'Shows all available commands',
  async execute(message) {
    const totalCommands = getTotalCommands();

    const categories = [
      { label: 'Server', emoji: '🖥️', value: 'server', description: 'Get All Server Command list' },
      { label: 'Moderation', emoji: '🛡️', value: 'moderation', description: 'Get All Moderation Command list' },
      { label: 'Information', emoji: 'ℹ️', value: 'information', description: 'Get All Information Command list' },
      { label: 'Giveaway', emoji: '🎉', value: 'giveaway', description: 'Get All Giveaway Command List' },
      { label: 'Utility', emoji: '⚙️', value: 'utility', description: 'Get All Utility Command list' },
      { label: 'Fun', emoji: '🎮', value: 'fun', description: 'Get All Fun Command list' },
    ];

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help-menu')
      .setPlaceholder('〙Select A Category To View Commands')
      .addOptions(categories.map(cat => ({
        label: cat.label,
        emoji: cat.emoji,
        value: cat.value,
        description: cat.description
      })));

    const dropdownRow = new ActionRowBuilder().addComponents(selectMenu);

    const buttonsRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('help_home')
        .setLabel('Home')
        .setEmoji('🏠')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('help_delete')
        .setLabel('Close')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('help_all')
        .setLabel('All Commands')
        .setEmoji('📜')
        .setStyle(ButtonStyle.Primary)
    );

    const helpEmbed = new EmbedBuilder()
      .setColor('#2b2d31')
      .setAuthor({
        name: `${message.client.user.username} Help Menu`,
        iconURL: message.client.user.displayAvatarURL(),
        url: `https://discord.com/oauth2/authorize?client_id=${message.client.user.id}&permissions=8&scope=bot`
      })
      .setThumbnail(message.client.user.displayAvatarURL())
      .setDescription('**Stratos bot’s commands will work without a prefix**')
      .addFields({
        name: '📁 __**Command Categories:**__',
        value: '🖥️ `∤` **Server**\n🛡️ `∤` **Moderation**\nℹ️ `∤` **Information**\n🎉 `∤` **Giveaway**\n⚙️ `∤` **Utility**\n🎮 `∤` **Fun**',
        inline: false
      })
      .setImage('https://cdn.discordapp.com/attachments/1355484630232338553/1361699857881895022/Picsart_25-03-28_21-03-16-017.jpg')
      .setFooter({ text: `Stratos Development`, iconURL: message.client.user.displayAvatarURL() });

    const sentMessage = await message.channel.send({ embeds: [helpEmbed], components: [dropdownRow, buttonsRow] });

    const collector = sentMessage.createMessageComponentCollector({ time: 600000 });

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({ content: '❌ | This menu is not for you!', ephemeral: true });
      }

      if (interaction.isStringSelectMenu()) {
        const selectedCategory = interaction.values[0];
        const categoryDetails = getCategoryDetails(selectedCategory);

        const categoryEmbed = new EmbedBuilder()
          .setColor('#2b2d31')
          .setTitle(`${categoryDetails.emoji} ${categoryDetails.title}`)
          .setDescription(categoryDetails.description)
          .setFooter({ text: `${message.client.user.username} Help` });

        await interaction.update({ embeds: [categoryEmbed], components: [dropdownRow, buttonsRow] });
      }

      if (interaction.isButton()) {
        if (interaction.customId === 'help_home') {
          await interaction.update({ embeds: [helpEmbed], components: [dropdownRow, buttonsRow] });
        }

        if (interaction.customId === 'help_delete') {
          await interaction.message.delete().catch(() => {});
        }

        if (interaction.customId === 'help_all') {
          const allCommandsEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({
              name: `${message.client.user.tag}`,
              iconURL: message.client.user.displayAvatarURL(),
              url: message.client.user.displayAvatarURL()
            })
            .setTitle('All Commands')
            .setDescription(
              '1. 🖥️ __Server Commands__\n**maintenance on, mt on, maintenance off, mt off, rename, deletechannel**\n\n' +
              '2. 🛡️ __Moderation Commands__\n**kick, ban, unban, lock, unlock, hide, unhide, purge, unhideall, hideall, lockall, unlockall**\n\n' +
              '3. ℹ️ __Information Commands__\n**invite, help, support, ping, uptime, stats**\n\n' +
              '4. 🎉 __Giveaway Commands__\n**gstart, gend, greroll**\n\n' +
              '5. ⚙️ __Utility Commands__\n**list emojis, list bots, list roles, list boosters, list bans, serverinfo**\n\n' +
              '6. 🎮 __Game Commands__\n**slap, kiss, hug**'
            );

          await interaction.update({ embeds: [allCommandsEmbed], components: [dropdownRow, buttonsRow] });
        }
      }
    });

    collector.on('end', () => {
      const disabledDropdown = new ActionRowBuilder().addComponents(selectMenu.setDisabled(true));
      const disabledButtons = new ActionRowBuilder().addComponents(
        buttonsRow.components.map(button => button.setDisabled(true))
      );
      sentMessage.edit({ components: [disabledDropdown, disabledButtons] }).catch(() => {});
    });

    function getTotalCommands() {
      const commandBasePath = path.join(__dirname, '../../commands');
      if (!fs.existsSync(commandBasePath)) return 0;

      let count = 0;
      const folders = fs.readdirSync(commandBasePath).filter(folder =>
        fs.statSync(path.join(commandBasePath, folder)).isDirectory()
      );

      for (const folder of folders) {
        count += fs.readdirSync(path.join(commandBasePath, folder)).filter(file => file.endsWith('.js')).length;
      }

      return count;
    }

    function getCategoryDetails(category) {
      const categoryData = {
        server: {
          emoji: '🖥️',
          title: 'Server Commands',
          description: '**maintenance on, mt on, maintenance off, mt off, rename, deletechannel**'
        },
        moderation: {
          emoji: '🛡️',
          title: 'Moderation Commands',
          description: '**kick, ban, unban, lock, unlock, hide, unhide, purge, unhideall, hideall, lockall, unlockall**'
        },
        information: {
          emoji: 'ℹ️',
          title: 'Information Commands',
          description: '**invite, help, support, ping, uptime, stats**'
        },
        giveaway: {
          emoji: '🎉',
          title: 'Giveaway Commands',
          description: '**gstart, gend, greroll**'
        },
        utility: {
          emoji: '⚙️',
          title: 'Utility Commands',
          description: '**list emojis, list bots, list roles, list boosters, list bans, serverinfo**'
        },
        fun: {
          emoji: '🎮',
          title: 'Game Commands',
          description: '**slap, kiss, hug**'
        }
      };
      return categoryData[category];
    }
  }
};