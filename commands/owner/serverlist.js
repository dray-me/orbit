const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { devId } = require('../../config.json'); // Fetch the developer ID from config

module.exports = {
  name: 'serverlist',
  description: 'Displays the list of servers the bot is in.',
  aliases: ['sl'],
  async execute(message, args, client) {
    // Check if the user is the developer
    if (message.author.id !== devId) {
      // Do nothing if the user is not the developer
      return;
    }

    // Get all servers the bot is in
    const servers = client.guilds.cache.map(guild => ({
      name: guild.name,
      id: guild.id,
      memberCount: guild.memberCount,
    }));

    // Split the servers into pages of 10 servers per page
    const pageSize = 10;
    const totalPages = Math.ceil(servers.length / pageSize);
    let page = parseInt(args[0], 10) || 1;

    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const serverPage = servers.slice(startIndex, endIndex);

    // Create the embed for the server list
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Server List')
      .setDescription(`Page **${page}** of **${totalPages}**`)
      .setFooter({
        text: `Requested by ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true }),
      });

    // Add fields for each server
    serverPage.forEach((server, index) => {
      embed.addFields({
        name: `#${startIndex + index + 1}: ${server.name}`,
        value: `**ID:** ${server.id}\n**Members:** ${server.memberCount}`,
      });
    });

    // Create buttons for pagination
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prevPage')
        .setLabel('Previous')
        .setStyle('Primary')
        .setDisabled(page <= 1),
      new ButtonBuilder()
        .setCustomId('nextPage')
        .setLabel('Next')
        .setStyle('Primary')
        .setDisabled(page >= totalPages)
    );

    // Send the embed and buttons
    const msg = await message.channel.send({
      embeds: [embed],
      components: totalPages > 1 ? [buttons] : [],
    });

    // Pagination handling
    const collector = msg.createMessageComponentCollector({
      filter: interaction => interaction.user.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async interaction => {
      if (interaction.customId === 'prevPage') {
        page--;
      } else if (interaction.customId === 'nextPage') {
        page++;
      }

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const serverPage = servers.slice(startIndex, endIndex);

      const updatedEmbed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('Server List')
        .setDescription(`Page **${page}** of **${totalPages}**`)
        .setFooter({
          text: `Requested by ${message.author.tag}`,
          iconURL: message.author.displayAvatarURL({ dynamic: true }),
        });

      serverPage.forEach((server, index) => {
        updatedEmbed.addFields({
          name: `#${startIndex + index + 1}: ${server.name}`,
          value: `**ID:** ${server.id}\n**Members:** ${server.memberCount}`,
        });
      });

      await interaction.update({
        embeds: [updatedEmbed],
        components: totalPages > 1 ? [buttons] : [],
      });
    });

    collector.on('end', () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  },
};
