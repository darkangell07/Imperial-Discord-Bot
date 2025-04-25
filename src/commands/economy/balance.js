import { getUser } from '../../database/database.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';

export default {
  name: 'balance',
  aliases: ['bal', 'money', 'coins'],
  category: 'economy',
  description: 'Check your current balance of Imperial Coins',
  usage: '!balance [user]',
  cooldown: 5,
  async execute(client, message, args) {
    try {
      let targetUser = message.mentions.users.first() || message.author;
      const guildId = message.guild.id;
      
      // Find or create user in database
      const user = await getUser(targetUser.id, guildId);
      
      // Create embed
      const embed = createEmbed({
        title: `${targetUser.username}'s Balance`,
        description: 'Imperial Treasury',
        color: COLORS.ECONOMY,
        thumbnail: targetUser.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: 'Wallet', value: `${user.balance} Imperial Coins`, inline: true },
          { name: 'Bank', value: `${user.bank} Imperial Coins`, inline: true },
          { name: 'Total', value: `${user.balance + user.bank} Imperial Coins`, inline: true }
        ],
        footer: { text: 'Imperial Bank' }
      });
      
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in balance command:', error);
      return message.reply('There was an error checking the balance. Please try again later.');
    }
  }
};