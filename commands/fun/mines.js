const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  name: 'mines',
  description: 'Play a fun minesweeper game with buttons!',
  async execute(message) {
    const betAmount = 100;
    const totalButtons = 25;
    const bombIndex = Math.floor(Math.random() * totalButtons);
    const picked = new Set();

    let buttons = Array.from({ length: totalButtons }, (_, i) =>
      new ButtonBuilder()
        .setCustomId(`mine_${i}`)
        .setLabel('?')
        .setStyle(ButtonStyle.Secondary)
    );

    // Create 5 rows of buttons
    let rows = [];
    for (let i = 0; i < 5; i++) {
      rows.push(new ActionRowBuilder().addComponents(buttons.slice(i * 5, i * 5 + 5)));
    }

    const embed = new EmbedBuilder()
      .setTitle('💎 Mines Game 💣')
      .setDescription(`**Bet Amount:** ${betAmount} coins\n**Current Multiplier:** 1x\n**Mines:** 1\n**Safe Diamonds Left:** 24`)
      .setColor('Blue')
      .setFooter({ text: `Player: ${message.author.tag}` });

    const msg = await message.channel.send({ embeds: [embed], components: rows });

    const collector = msg.createMessageComponentCollector({ time: 15 * 60 * 1000 }); // 15 minutes

    collector.on('collect', async (interaction) => {
      if (interaction.user.id !== message.author.id)
        return interaction.reply({ content: `This isn't your game!`, ephemeral: true });

      const index = parseInt(interaction.customId.split('_')[1]);
      if (picked.has(index)) return interaction.deferUpdate();

      if (index === bombIndex) {
        // Bomb hit
        buttons[index].setLabel('💣').setStyle(ButtonStyle.Danger).setDisabled(true);
        picked.forEach(id => buttons[id].setDisabled(true));
        embed.setDescription(`**Bet Amount:** ${betAmount} coins\n**Current Multiplier:** 1x\n**Mines:** 1\n**Safe Diamonds Left:** ${totalButtons - picked.size - 1}`);
        embed.setColor('Red');

        // Disable all buttons
        buttons.forEach(btn => btn.setDisabled(true));
        for (let i = 0; i < 5; i++) {
          rows[i] = new ActionRowBuilder().addComponents(buttons.slice(i * 5, i * 5 + 5));
        }

        await interaction.update({ content: '**Boom! You hit the bomb!**', embeds: [embed], components: rows });
        return collector.stop();
      }

      picked.add(index);
      const safeLeft = totalButtons - 1 - picked.size;
      const multiplier = (1 + picked.size * 0.1).toFixed(2);

      buttons[index].setLabel('💎').setStyle(ButtonStyle.Success).setDisabled(true);
      embed.setDescription(`**Bet Amount:** ${betAmount} coins\n**Current Multiplier:** ${multiplier}x\n**Mines:** 1\n**Safe Diamonds Left:** ${safeLeft}`);

      for (let i = 0; i < 5; i++) {
        rows[i] = new ActionRowBuilder().addComponents(buttons.slice(i * 5, i * 5 + 5));
      }

      await interaction.update({ embeds: [embed], components: rows });
    });

    collector.on('end', async () => {
      // Disable all remaining buttons
      buttons.forEach(btn => btn.setDisabled(true));
      for (let i = 0; i < 5; i++) {
        rows[i] = new ActionRowBuilder().addComponents(buttons.slice(i * 5, i * 5 + 5));
      }
      await msg.edit({ components: rows });
    });
  }
};