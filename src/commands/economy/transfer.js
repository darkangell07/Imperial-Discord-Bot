import { getUser, updateUser } from '../../database/database.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';

export default {
  name: 'transfer',
  aliases: ['send', 'pay'],
  category: 'economy',
  description: 'Transfer Imperial Coins to another user',
  usage: '!transfer <user> <amount>',
  cooldown: 10,
  async execute(client, message, args) {
    try {
      if (args.length < 2) {
        return message.reply(`Please specify a user and an amount. Usage: ${this.usage}`);
      }
      
      // Get target user
      const targetUser = message.mentions.users.first();
      if (!targetUser) {
        return message.reply('Please mention a user to transfer coins to.');
      }
      
      // Check if user is trying to send coins to themselves
      if (targetUser.id === message.author.id) {
        return message.reply('You cannot transfer coins to yourself.');
      }
      
      // Check if target is a bot
      if (targetUser.bot) {
        return message.reply('You cannot transfer coins to a bot.');
      }
      
      // Get amount
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) {
        return message.reply('Please specify a valid amount of coins to transfer.');
      }
      
      // Get sender data
      const sender = await getUser(message.author.id, message.guild.id);
      
      // Check if sender has enough coins
      if (sender.balance < amount) {
        return message.reply(`You don't have enough coins. Your balance: ${sender.balance} Imperial Coins.`);
      }
      
      // Get receiver data
      const receiver = await getUser(targetUser.id, message.guild.id);
      
      // Transfer coins
      sender.balance -= amount;
      receiver.balance += amount;
      
      // Save changes
      await Promise.all([
        updateUser(message.author.id, message.guild.id, sender),
        updateUser(targetUser.id, message.guild.id, receiver)
      ]);
      
      // Create success embed
      const embed = createEmbed({
        title: 'Imperial Transfer',
        description: `Successfully transferred **${amount} Imperial Coins** to ${targetUser.username}!`,
        color: COLORS.SUCCESS,
        fields: [
          { name: 'Your New Balance', value: `${sender.balance} Imperial Coins`, inline: true }
        ],
        thumbnail: message.author.displayAvatarURL({ dynamic: true }),
        footer: { text: 'Imperial Bank' }
      });
      
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in transfer command:', error);
      return message.reply('There was an error transferring Imperial Coins. Please try again later.');
    }
  }
};