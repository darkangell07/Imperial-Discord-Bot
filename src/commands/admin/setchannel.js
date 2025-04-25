import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { setRestrictedChannel } from '../../database/database.js';

export default {
  name: 'setchannel',
  category: 'admin',
  description: 'Set a channel for specific command categories',
  usage: '!setchannel <category> <#channel>',
  permissions: [PermissionFlagsBits.ManageGuild],
  cooldown: 5,
  async execute(client, message, args) {
    try {
      if (args.length < 2) {
        return message.reply('Please specify a category and a channel. Usage: `!setchannel <category> <#channel>`');
      }
      
      const category = args[0].toLowerCase();
      const validCategories = ['economy', 'games', 'fun', 'general'];
      
      // Validate category
      if (!validCategories.includes(category)) {
        return message.reply(`Invalid category. Valid categories are: ${validCategories.join(', ')}`);
      }
      
      // Get channel
      const channel = message.mentions.channels.first() || 
                      message.guild.channels.cache.get(args[1]);
      
      if (!channel) {
        return message.reply('Could not find that channel. Please mention a channel or provide a valid channel ID.');
      }
      
      // Update settings
      await setRestrictedChannel(message.guild.id, category, channel.id);
      
      // Create success embed
      const embed = createEmbed({
        title: 'Channel Restriction Set',
        description: `${category.charAt(0).toUpperCase() + category.slice(1)} commands will now only work in ${channel}.`,
        color: COLORS.ADMIN,
        fields: [
          { name: 'Category', value: category, inline: true },
          { name: 'Channel', value: `<#${channel.id}>`, inline: true }
        ],
        footer: { text: 'To remove this restriction, use !setchannel category none' }
      });
      
      return message.reply({ embeds: [embed] });
    } catch (error) {
      logger.error('Error in setchannel command:', error);
      return message.reply('There was an error setting the channel restriction. Please try again later.');
    }
  }
};