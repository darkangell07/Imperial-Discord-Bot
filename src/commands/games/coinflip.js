import { getUser, updateUser } from '../../database/database.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';

export default {
  name: 'coinflip',
  aliases: ['flip', 'cf'],
  category: 'games',
  description: 'Flip a coin and bet Imperial Coins',
  usage: '!coinflip <heads/tails> <amount>',
  cooldown: 10,
  async execute(client, message, args) {
    try {
      if (args.length < 2) {
        return message.reply('Please specify a side (heads/tails) and an amount to bet. Example: `!coinflip heads 100`');
      }
      
      // Parse arguments
      const choice = args[0].toLowerCase();
      const betAmount = parseInt(args[1]);
      
      // Validate choice
      if (choice !== 'heads' && choice !== 'tails') {
        return message.reply('Please choose either `heads` or `tails`.');
      }
      
      // Validate bet amount
      if (isNaN(betAmount) || betAmount <= 0) {
        return message.reply('Bet amount must be a positive number.');
      }
      
      // Get user
      const user = await getUser(message.author.id, message.guild.id);
      
      // Check if user has enough coins
      if (user.balance < betAmount) {
        return message.reply(`You don't have enough Imperial Coins. You need ${betAmount} coins, but you only have ${user.balance}.`);
      }
      
      // Flip the coin
      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = choice === result;
      
      // Calculate winnings/losses
      const winAmount = won ? betAmount : -betAmount;
      
      // Update user balance
      await updateUser(user.id, { balance: user.balance + winAmount });
      
      // Determine emoji
      const resultEmoji = result === 'heads' ? '🪙' : '🪙';
      
      // Create embed for the result
      const embed = createEmbed({
        title: 'Imperial Coinflip',
        description: `${resultEmoji} The coin shows **${result}**!`,
        color: won ? COLORS.SUCCESS : COLORS.ERROR,
        fields: [
          { 
            name: won ? 'You won!' : 'You lost!', 
            value: won ? 
              `You won ${betAmount} Imperial Coins!` : 
              `You lost ${betAmount} Imperial Coins.`,
            inline: true 
          },
          { 
            name: 'Current Balance', 
            value: `${user.balance} Imperial Coins`, 
            inline: true 
          }
        ],
        thumbnail: message.author.displayAvatarURL({ dynamic: true }),
        footer: { text: 'Imperial Games' }
      });
      
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in coinflip command:', error);
      return message.reply('There was an error flipping the coin. Please try again later.');
    }
  }
};