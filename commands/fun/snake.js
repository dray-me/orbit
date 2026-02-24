const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'snake',
  aliases: [],
  category: 'Fun',
  description: 'Play Snake game!',
  run: async (client, message) => {
    const gridSize = 9;
    let snake = [{ x: 4, y: 4 }];
    let apple = { x: 2, y: 2 };
    let direction = { x: 1, y: 0 };
    let applesCollected = 0;
    let lastMove = Date.now();

    const generateApple = () => {
      let x, y, overlap;
      do {
        x = Math.floor(Math.random() * gridSize);
        y = Math.floor(Math.random() * gridSize);
        overlap = snake.some(seg => seg.x === x && seg.y === y);
      } while (overlap);
      return { x, y };
    };

    const renderBoard = () => {
      let board = '';
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const isHead = snake[0].x === x && snake[0].y === y;
          const isBody = snake.some((s, i) => i !== 0 && s.x === x && s.y === y);
          const isApple = apple.x === x && apple.y === y;
          if (isHead) board += '🟢';
          else if (isBody) board += '🟩';
          else if (isApple) board += '🍎';
          else board += '⬛';
        }
        board += '\n';
      }
      return board;
    };

    const moveSnake = () => {
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
      if (
        head.x < 0 || head.x >= gridSize ||
        head.y < 0 || head.y >= gridSize ||
        snake.some(seg => seg.x === head.x && seg.y === head.y)
      ) return false;

      snake.unshift(head);

      if (head.x === apple.x && head.y === apple.y) {
        applesCollected++;
        apple = generateApple();
      } else {
        snake.pop();
      }
      return true;
    };

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('up').setStyle(ButtonStyle.Primary).setEmoji('⬆️')
    );
    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('left').setStyle(ButtonStyle.Primary).setEmoji('⬅️'),
      new ButtonBuilder().setCustomId('right').setStyle(ButtonStyle.Primary).setEmoji('➡️')
    );
    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('down').setStyle(ButtonStyle.Primary).setEmoji('⬇️')
    );

    const embed = new EmbedBuilder()
      .setTitle(`Snake Game - ${message.author.tag}`)
      .setDescription(renderBoard())
      .setColor('Green');

    const gameMessage = await message.channel.send({ embeds: [embed], components: [row1, row2, row3] });

    const collector = gameMessage.createMessageComponentCollector({ time: 20 * 60 * 1000 });

    let timeout;

    const endGame = (reason) => {
      gameMessage.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Game Over - ${message.author.tag}`)
            .setDescription(`**${reason}**\n**Total Apples Grabbed:** ${applesCollected}`)
            .setFooter({ text: `Today at Time ${new Date().toLocaleTimeString('en-US', { hour12: true })}` })
            .setColor('Red')
        ],
        components: []
      });
      collector.stop();
    };

    const resetTimeout = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => endGame('Timed Out'), 5 * 60 * 1000);
    };

    resetTimeout();

    collector.on('collect', async (i) => {
      if (i.user.id !== message.author.id) return i.reply({ content: 'This is not your game!', ephemeral: true });

      resetTimeout();
      switch (i.customId) {
        case 'up': direction = { x: 0, y: -1 }; break;
        case 'down': direction = { x: 0, y: 1 }; break;
        case 'left': direction = { x: -1, y: 0 }; break;
        case 'right': direction = { x: 1, y: 0 }; break;
      }

      const moved = moveSnake();
      if (!moved) return endGame('Game Over');

      i.update({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Snake Game - ${message.author.tag}`)
            .setDescription(renderBoard())
            .setColor('Green')
        ],
        components: [row1, row2, row3]
      });
    });

    collector.on('end', (_, reason) => {
      if (reason !== 'messageDelete') {
        endGame('Timed Out');
      }
    });
  }
};