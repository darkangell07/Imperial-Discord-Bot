import { ActivityType } from 'discord.js';
import { logger } from '../utils/logger.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    try {
      const guildCount = client.guilds.cache.size;
      const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
      const commandCount = client.commands.size;
      
      // Create ASCII banner
      const banner = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    IMPERIAL DISCORD BOT                      ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Bot Name: ${client.user.username.padEnd(42)}║
║  Bot ID: ${client.user.id.padEnd(45)}║
║  Prefix: ${client.config.prefix.padEnd(45)}║
║  Guilds: ${guildCount.toString().padEnd(45)}║
║  Users: ${userCount.toString().padEnd(45)}║
║  Commands: ${commandCount.toString().padEnd(42)}║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
      `;
      
      console.log(banner);
      
      // Set bot status/activity
      client.user.setPresence({ 
        activities: [{ 
          name: `${client.config.prefix}help | ${guildCount} servers`, 
          type: 3 // WATCHING
        }], 
        status: 'online' 
      });
      
      logger.info(`Logged in as ${client.user.tag}`);
      logger.info(`Serving ${userCount} users in ${guildCount} servers`);
      logger.info(`Loaded ${commandCount} commands`);
      logger.info('Ready and operational!');
    } catch (error) {
      logger.error('Error in ready event:', error);
    }
  }
};