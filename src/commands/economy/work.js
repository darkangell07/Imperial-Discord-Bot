import { getUser, updateUser } from '../../database/database.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';
import { getRandomJob } from '../../utils/jobs.js';

// Define possible jobs and their salary ranges
const jobs = [
  { title: 'Guard', min: 50, max: 150, message: 'You patrolled the Imperial City and earned {amount} coins.' },
  { title: 'Merchant', min: 70, max: 180, message: 'You sold exotic goods in the market and earned {amount} coins.' },
  { title: 'Blacksmith', min: 80, max: 200, message: 'You forged weapons for the Imperial Army and earned {amount} coins.' },
  { title: 'Courier', min: 40, max: 120, message: 'You delivered important messages across the Empire and earned {amount} coins.' },
  { title: 'Alchemist', min: 90, max: 220, message: 'You brewed magical potions and earned {amount} coins.' },
  { title: 'Miner', min: 60, max: 160, message: 'You mined precious minerals from the Imperial Mines and earned {amount} coins.' },
  { title: 'Hunter', min: 50, max: 170, message: 'You hunted wild animals and earned {amount} coins for the pelts.' },
  { title: 'Scribe', min: 70, max: 190, message: 'You copied ancient manuscripts for the Imperial Library and earned {amount} coins.' }
];

export default {
  name: 'work',
  aliases: ['job'],
  category: 'economy',
  description: 'Work to earn Imperial Coins',
  usage: '!work',
  cooldown: 60 * 30, // 30 minutes
  async execute(client, message, args) {
    try {
      const userId = message.author.id;
      const guildId = message.guild.id;
      
      // Find or create user
      const user = await getUser(userId, guildId);
      
      // Check cooldown
      const now = new Date();
      const lastWork = user.lastWork ? new Date(user.lastWork) : null;
      
      if (lastWork) {
        const cooldownTime = new Date(lastWork.getTime() + 30 * 60 * 1000); // 30 minutes
        
        if (now < cooldownTime) {
          const timeLeft = cooldownTime - now;
          const minutesLeft = Math.floor(timeLeft / (1000 * 60));
          const secondsLeft = Math.floor((timeLeft / 1000) % 60);
          
          const embed = createEmbed({
            title: 'Work - Cooldown',
            description: 'You are still tired from your last job.',
            color: COLORS.WARNING,
            fields: [
              { name: 'Rest Time Remaining', value: `${minutesLeft}m ${secondsLeft}s`, inline: true }
            ],
            thumbnail: message.author.displayAvatarURL({ dynamic: true }),
            footer: { text: 'Imperial Labor Office' }
          });
          
          return message.reply({ embeds: [embed] });
        }
      }
      
      // Select a random job
      const job = getRandomJob(jobs);
      
      // Calculate earnings
      const amount = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
      
      // Update user data
      user.balance += amount;
      user.lastWork = now;
      await updateUser(user);
      
      // Create job message
      const jobMessage = job.message.replace('{amount}', amount);
      
      // Create success embed
      const embed = createEmbed({
        title: `Work - ${job.title}`,
        description: jobMessage,
        color: COLORS.ECONOMY,
        fields: [
          { name: 'Earned', value: `${amount} Imperial Coins`, inline: true },
          { name: 'Current Balance', value: `${user.balance} Imperial Coins`, inline: true }
        ],
        thumbnail: message.author.displayAvatarURL({ dynamic: true }),
        footer: { text: 'Work again in 30 minutes' }
      });
      
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in work command:', error);
      return message.reply('There was an error while working. Please try again later.');
    }
  }
};