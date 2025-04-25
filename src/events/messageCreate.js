import { Collection } from 'discord.js';
import { logger } from '../utils/logger.js';
import { getGuildSettings } from '../database/database.js';
import { handleCommandError } from '../utils/errorHandler.js';
import { errorEmbed, createEmbed, COLORS } from '../utils/embeds.js';

// Developer user ID with all permissions
const DEVELOPER_ID = '918152747377905675';

export default {
  name: 'messageCreate',
  once: false,
  async execute(client, message) {
    try {
      // Ignore messages from bots
    if (message.author.bot) return;
    
      // Ignore DMs for now
      if (!message.guild) return;
      
      // Get guild settings
    const guildSettings = await getGuildSettings(message.guild.id);
    const prefix = client.config.prefix;
    
      // Check if message starts with the prefix
    if (!message.content.startsWith(prefix)) return;
    
    // Extract command name and arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
      // Find the command
    const command = client.commands.get(commandName) || 
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
      // If command doesn't exist, return
    if (!command) return;
    
    // Check if command is restricted to specific channels
    if (command.category && guildSettings.restrictedChannels && 
        guildSettings.restrictedChannels[command.category] && 
        message.channel.id !== guildSettings.restrictedChannels[command.category]) {
      const restrictedChannel = message.guild.channels.cache.get(
        guildSettings.restrictedChannels[command.category]
      );
      
      if (restrictedChannel) {
          return message.reply({ 
            embeds: [createEmbed({
              title: 'Channel Restricted',
              description: `This command can only be used in ${restrictedChannel}.`,
              color: COLORS.WARNING
            })]
          });
      }
    }
    
    // Check permissions (Skip for developer)
    if (command.permissions && message.author.id !== DEVELOPER_ID) {
      const authorPerms = message.channel.permissionsFor(message.author);
      if (!authorPerms || !command.permissions.every(perm => authorPerms.has(perm))) {
          return message.reply({ 
            embeds: [errorEmbed('You do not have permission to use this command!')] 
          });
      }
    }
    
    // Handle cooldowns
    const { cooldowns } = client;
    
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Collection());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || client.config.defaultCooldown) * 1000;
    
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
          
          return message.reply({
            embeds: [createEmbed({
              title: 'Command Cooldown',
              description: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`,
              color: COLORS.WARNING,
              footer: { text: 'Cooldowns help prevent command spam' }
            })]
          });
      }
    }
    
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    
    // Execute the command
    try {
      logger.info(
        `User ${message.author.tag} executed command: ${commandName} ${args.join(' ')}`
      );
      await command.execute(client, message, args);
    } catch (error) {
        // Use our error handler
        await handleCommandError(error, message, commandName);
      }
    } catch (error) {
      logger.error('Error in messageCreate event:', error);
    }
  },
};