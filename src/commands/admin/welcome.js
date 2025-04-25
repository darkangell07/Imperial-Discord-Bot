import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { setWelcomeChannel, setWelcomeDm } from '../../database/database.js';

export default {
  name: 'welcome',
  category: 'admin',
  description: 'Configure welcome messages for new members',
  usage: '!welcome <set-channel/set-message/dm-message> [value]',
  permissions: [PermissionFlagsBits.ManageGuild],
  cooldown: 5,
  async execute(client, message, args) {
    try {
      if (!args.length) {
        return message.reply('Please specify a subcommand. Usage: `!welcome <set-channel/set-message/dm-message> [value]`');
      }
      
      const subCommand = args[0].toLowerCase();
      
      switch (subCommand) {
        case 'set-channel':
          return handleSetChannel(message, args.slice(1));
          
        case 'set-message':
          return handleSetMessage(message, args.slice(1));
          
        case 'dm-message':
          return handleDmMessage(message, args.slice(1));
          
        default:
          return message.reply('Invalid subcommand. Valid subcommands are: set-channel, set-message, dm-message');
      }
    } catch (error) {
      logger.error('Error in welcome command:', error);
      return message.reply('There was an error configuring welcome messages. Please try again later.');
    }
  }
};

async function handleSetChannel(message, args) {
  // Get channel
  const channel = message.mentions.channels.first() || 
                 (args[0] ? message.guild.channels.cache.get(args[0]) : null);
  
  if (!channel && args[0] !== 'none') {
    return message.reply('Could not find that channel. Please mention a channel, provide a valid channel ID, or use "none" to disable welcome messages.');
  }
  
  // Get welcome message
  const welcomeMessage = args.slice(1).join(' ');
  
  // Update settings
  await setWelcomeChannel(
    message.guild.id, 
    args[0] === 'none' ? null : (channel ? channel.id : null), 
    welcomeMessage || null
  );
  
  // Create success embed
  const embed = createEmbed({
    title: 'Welcome Channel Updated',
    description: channel ? 
      `Welcome messages will now be sent to ${channel}.` : 
      'Welcome messages have been disabled.',
    color: COLORS.ADMIN,
    fields: welcomeMessage ? [
      { name: 'Message', value: welcomeMessage, inline: false }
    ] : [],
    footer: { text: 'Available placeholders: {user}, {server}, {memberCount}' }
  });
  
  return message.reply({ embeds: [embed] });
}

async function handleSetMessage(message, args) {
  if (!args.length) {
    return message.reply('Please provide a welcome message.');
  }
  
  const welcomeMessage = args.join(' ');
  
  // Update settings
  await setWelcomeChannel(message.guild.id, null, welcomeMessage);
  
  // Create success embed
  const embed = createEmbed({
    title: 'Welcome Message Updated',
    description: 'The welcome message has been updated.',
    color: COLORS.ADMIN,
    fields: [
      { name: 'Message', value: welcomeMessage, inline: false }
    ],
    footer: { text: 'Available placeholders: {user}, {server}, {memberCount}' }
  });
  
  return message.reply({ embeds: [embed] });
}

async function handleDmMessage(message, args) {
  if (!args.length) {
    return message.reply('Please provide a welcome DM message or use "none" to disable welcome DMs.');
  }
  
  const dmMessage = args.join(' ');
  const disableDm = dmMessage.toLowerCase() === 'none';
  
  // Update settings
  await setWelcomeDm(
    message.guild.id, 
    !disableDm, 
    disableDm ? null : dmMessage
  );
  
  // Create success embed
  const embed = createEmbed({
    title: 'Welcome DM Updated',
    description: disableDm ? 
      'Welcome DMs have been disabled.' : 
      'Welcome DM message has been updated.',
    color: COLORS.ADMIN,
    fields: !disableDm ? [
      { name: 'Message', value: dmMessage, inline: false }
    ] : [],
    footer: { text: 'Available placeholders: {user}, {server}' }
  });
  
  return message.reply({ embeds: [embed] });
}