const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp', 'profilepic'],
  description: 'Shows a user\'s avatar in high quality',
  usage: '!avatar [@user | userID]',

  async execute(message, args) {
    const client = message.client;

    try {
      let targetUser;

      // Get user from mention or ID
      if (message.mentions.users.first()) {
        targetUser = message.mentions.users.first();
      } else if (args[0]) {
        try {
          targetUser = await client.users.fetch(args[0]);
        } catch {
          const notFoundEmbed = new EmbedBuilder()
            .setColor(0x2f3136)
            .setTitle('**User Not Found**')
            .setDescription('Could not find that user. Please mention a user or provide a valid user ID.');
          return message.reply({ embeds: [notFoundEmbed] });
        }
      } else {
        targetUser = message.author;
      }

      // Fetch member (if in guild)
      let guildMember = null;
      try {
        guildMember = await message.guild.members.fetch(targetUser.id);
      } catch {
        // Not in guild or unable to fetch
      }

      // Avatar URLs
      const globalAvatar = targetUser.displayAvatarURL({ dynamic: true, size: 4096 });
      const serverAvatar = guildMember?.avatarURL({ dynamic: true, size: 4096 }) || null;

      const avatarToShow = serverAvatar || globalAvatar;

      const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setTitle(`**${targetUser.username}'s Avatar**`)
        .setImage(avatarToShow)
        .setFooter({ text: serverAvatar ? 'Showing Server Avatar' : 'Showing Global Avatar' });

      const formatsRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('PNG (1024px)')
          .setStyle(ButtonStyle.Link)
          .setURL(targetUser.displayAvatarURL({ format: 'png', size: 1024 })),
        new ButtonBuilder()
          .setLabel('JPG (1024px)')
          .setStyle(ButtonStyle.Link)
          .setURL(targetUser.displayAvatarURL({ format: 'jpg', size: 1024 })),
        new ButtonBuilder()
          .setLabel('WEBP (1024px)')
          .setStyle(ButtonStyle.Link)
          .setURL(targetUser.displayAvatarURL({ format: 'webp', size: 1024 }))
      );

      // Add GIF if animated
      const isGif = targetUser.avatar?.startsWith('a_');
      if (isGif) {
        formatsRow.addComponents(
          new ButtonBuilder()
            .setLabel('GIF (1024px)')
            .setStyle(ButtonStyle.Link)
            .setURL(targetUser.displayAvatarURL({ format: 'gif', size: 1024 }))
        );
      }

      const components = [formatsRow];

      // Add second row if server avatar is different
      if (serverAvatar && globalAvatar !== serverAvatar) {
        const secondRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('View Global Avatar')
            .setStyle(ButtonStyle.Link)
            .setURL(globalAvatar),
          new ButtonBuilder()
            .setLabel('View Server Avatar')
            .setStyle(ButtonStyle.Link)
            .setURL(serverAvatar)
        );
        components.push(secondRow);
      }

      await message.reply({ embeds: [embed], components });

      console.log(`✅ Avatar command run by ${message.author.username} for ${targetUser.username}`);

    } catch (error) {
      console.error('❌ Error in avatar command:', error);
      return message.reply('An error occurred while fetching the avatar. Please try again later.');
    }
  }
};
