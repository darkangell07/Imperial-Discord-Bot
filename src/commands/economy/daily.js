import { getUser, updateUser } from '../../database/database.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';

export default {
  name: 'daily',
  category: 'economy',
  description: 'Collect your daily Imperial Coins',
  usage: '!daily',
  cooldown: 10,
  async execute(client, message, args) {
    try {
      const userId = message.author.id;
      const guildId = message.guild.id;
      
      // Find or create user
      const user = await getUser(userId, guildId);
      
      // Check if daily reward was already claimed
      const now = new Date();
      const lastDaily = user.lastDaily ? new Date(user.lastDaily) : null;
      
      // Calculate time until next daily
      if (lastDaily) {
        const tomorrow = new Date(lastDaily);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (now < tomorrow) {
          const timeLeft = tomorrow - now;
          const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          
          const embed = createEmbed({
            title: 'Daily Reward - Already Claimed',
            description: 'You have already claimed your daily reward.',
            color: COLORS.WARNING,
            fields: [
              { name: 'Next Reward', value: `${hoursLeft}h ${minutesLeft}m`, inline: true }
            ],
            thumbnail: message.author.displayAvatarURL({ dynamic: true }),
            footer: { text: 'Imperial Bank' }
          });
          
          return message.reply({ embeds: [embed] });
        }
      }
      
      // Calculate reward (base amount + bonus based on streak)
      const dailyAmount = 250;
      
      // Update user data
      user.balance += dailyAmount;
      user.lastDaily = now;
      await updateUser(user);
      
      // Create success embed
      const embed = createEmbed({
        title: 'Daily Reward Collected!',
        description: `You have received **${dailyAmount} Imperial Coins**!`,
        color: COLORS.ECONOMY,
        fields: [
          { name: 'Current Balance', value: `${user.balance} Imperial Coins`, inline: true },
          { name: 'Bank Balance', value: `${user.bank} Imperial Coins`, inline: true }
        ],
        thumbnail: message.author.displayAvatarURL({ dynamic: true }),
        footer: { text: 'Daily rewards reset every 24 hours' }
      });
      
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in daily command:', error);
      return message.reply('There was an error claiming your daily reward. Please try again later.');
    }
  }
};