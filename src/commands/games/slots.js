import { getUser, updateUser } from '../../database/database.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';

export default {
  name: 'slots',
  aliases: ['slot', 'slotmachine'],
  category: 'games',
  description: 'Play the slot machine and win Imperial Coins',
  usage: '!slots <amount>',
  cooldown: 15,
  async execute(client, message, args) {
    try {
      if (!args.length) {
        return message.reply('Please specify an amount to bet. Usage: `!slots <amount>`');
      }
      
      // Parse bet amount
      const betAmount = parseInt(args[0]);
      
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
      
      // Slot symbols
      const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '💎', '7️⃣', '🎰'];
      
      // Generate slot results
      const results = Array(3).fill().map(() => symbols[Math.floor(Math.random() * symbols.length)]);
      
      // Check for wins
      let multiplier = 0;
      
      // All three match
      if (results[0] === results[1] && results[1] === results[2]) {
        if (results[0] === '7️⃣') multiplier = 10;      // Jackpot
        else if (results[0] === '💎') multiplier = 7;  // Three diamonds
        else multiplier = 5;                          // Any other three matching
      }
      // Two matches
      else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
        multiplier = 2;  // Two matching
      }
      
      // Calculate winnings
      const winnings = betAmount * multiplier;
      const netGain = winnings - betAmount;
      
      // Update user balance
      user.balance += netGain;
      await updateUser(user);
      
      // Create result message
      const resultMessage = multiplier > 0 ? 
        `You won **${winnings} Imperial Coins**!` : 
        `You lost **${betAmount} Imperial Coins**.`;
      
      // Create slot display
      const slotsDisplay = `
      ╔═══════════╗
      ║ ${results[0]} │ ${results[1]} │ ${results[2]} ║
      ╚═══════════╝
      `;
      
      // Create embed
      const embed = createEmbed({
        title: 'Imperial Slots',
        description: slotsDisplay,
        color: multiplier > 0 ? COLORS.SUCCESS : COLORS.ERROR,
        fields: [
          { name: 'Result', value: resultMessage, inline: false },
          { name: 'Current Balance', value: `${user.balance} Imperial Coins`, inline: true }
        ],
        thumbnail: message.author.displayAvatarURL({ dynamic: true }),
        footer: { text: multiplier > 0 ? 'Winner!' : 'Better luck next time!' }
      });
      
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in slots command:', error);
      return message.reply('There was an error playing slots. Please try again later.');
    }
  }
};