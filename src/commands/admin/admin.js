import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { setRestrictedChannel, getGuildSettings, updateGuildSettings } from '../../database/database.js';

// Developer user ID with all permissions
const DEVELOPER_ID = '918152747377905675';

export default {
  name: 'admin',
  category: 'admin',
  description: 'Admin command to manage bot settings',
  usage: '!admin <option> [value]',
  permissions: [PermissionFlagsBits.ManageGuild],
  hidden: true, // This will hide it from the help command
  cooldown: 5,
  async execute(client, message, args) {
    try {
      // Check if user has Manage Guild permission or is the developer
      if (message.author.id !== DEVELOPER_ID && !message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply({
          embeds: [createEmbed({
            title: 'Permission Denied',
            description: 'You need the Manage Server permission to use this command.',
            color: COLORS.ERROR
          })]
        });
      }
      
      if (!args.length) {
        return showAdminHelp(client, message);
      }
      
      const option = args[0].toLowerCase();
      
      // Handle different admin options
      switch (option) {
        case 'announce':
        case 'announcement':
          return handleAnnouncement(client, message, args.slice(1));
        case 'embed':
          return handleEmbed(client, message, args.slice(1));
        case 'setchannel':
          return handleSetChannel(client, message, args.slice(1));
        case 'settings':
          return showSettings(client, message);
        case 'setmodlogs':
          return handleSetModLogs(client, message, args.slice(1));
        case 'custommessage':
          return handleCustomMessage(client, message, args.slice(1));
        case 'resetmessage':
          return handleResetMessage(client, message, args.slice(1));
        case 'setwelcome':
          return handleSetWelcome(client, message, args.slice(1));
        case 'welcomedm':
          return handleWelcomeDM(client, message, args.slice(1));
        case 'automod':
          return handleAutomod(client, message, args.slice(1));
        default:
          return message.reply(`Unknown admin option: \`${option}\`. Use \`!admin\` to see available options.`);
      }
    } catch (error) {
      logger.error('Error in admin command:', error);
      return message.reply({
        embeds: [createEmbed({
          title: 'Error',
          description: 'An error occurred while processing this command.',
          color: COLORS.ERROR
        })]
      });
    }
  }
};

/**
 * Display admin help information
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 */
async function showAdminHelp(client, message) {
  const embed = createEmbed({
    title: '⚙️ Admin Command Help',
    description: '🔐 Admin commands to manage bot settings. These commands require the "Manage Server" permission.',
    color: COLORS.ADMIN,
    fields: [
      {
        name: '📢 !admin announce <#channel> <message>',
        value: 'Send an announcement to the specified channel\nExample: `!admin announce #announcements Server maintenance tonight at 10 PM!`',
        inline: false
      },
      {
        name: '🖼️ !admin embed <#channel> <title> | <description> | [imageURL]',
        value: 'Send an embedded message to the specified channel (image is optional)\nExample: `!admin embed #news Server Update | We\'ve added new features! | https://example.com/image.png`',
        inline: false
      },
      {
        name: '📌 !admin setchannel <category> <#channel>',
        value: 'Restrict a command category to a specific channel\nCategories: `economy`, `fun`, `games`, `general`\nExample: `!admin setchannel economy #economy-commands`',
        inline: false
      },
      {
        name: '🔓 !admin setchannel <category> none',
        value: 'Remove channel restriction for a category\nExample: `!admin setchannel fun none`',
        inline: false
      },
      {
        name: '📜 !admin setmodlogs <#channel>',
        value: 'Set channel for moderation logs\nExample: `!admin setmodlogs #mod-logs`',
        inline: false
      },
      {
        name: '💬 !admin custommessage <type> <message>',
        value: 'Customize moderation messages\nTypes: `ban`, `mute`, `warn`, `timeout`\nExample: `!admin custommessage ban User {user} was banned for {reason}`',
        inline: false
      },
      {
        name: '🔄 !admin resetmessage <type>',
        value: 'Reset a custom message to default\nExample: `!admin resetmessage ban`',
        inline: false
      },
      {
        name: '👋 !admin setwelcome <#channel> [message]',
        value: 'Set welcome channel and optional message\nExample: `!admin setwelcome #welcome Welcome {user} to {server}!`\nUse `none` as channel to disable',
        inline: false
      },
      {
        name: '✉️ !admin welcomedm <on/off> [message]',
        value: 'Enable/disable welcome DMs and set optional message\nExample: `!admin welcomedm on Thanks for joining {server}!`',
        inline: false
      },
      {
        name: '🤖 !admin automod <setting> <value>',
        value: 'Configure automod settings\nSettings: `enabled`, `profanity`, `mentions`, `emojis`, `spam`\nExample: `!admin automod enabled on`',
        inline: false
      },
      {
        name: '🔍 !admin settings',
        value: 'Show all current bot settings for this server',
        inline: false
      }
    ],
    footer: { text: '🔒 Admin commands are hidden from regular users' }
  });
  
  return message.reply({ embeds: [embed] });
}

/**
 * Handle sending an announcement
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleAnnouncement(client, message, args) {
  if (args.length < 2) {
    return message.reply('❌ Please specify a channel and announcement message. Usage: `!admin announce <#channel> <message>`');
  }
  
  // Get channel
  const channel = message.mentions.channels.first() || 
                 message.guild.channels.cache.get(args[0]);
  
  if (!channel) {
    return message.reply('❓ Could not find that channel. Please mention a channel or provide a valid channel ID.');
  }
  
  // Get announcement message
  const announcement = args.slice(1).join(' ');
  
  try {
    // Send the announcement
    await channel.send({
      content: announcement
    });
    
    // Create success embed
    const embed = createEmbed({
      title: '📢 Announcement Sent',
      description: `✅ Successfully sent announcement to ${channel}.`,
      color: COLORS.SUCCESS,
      fields: [
        { name: '📌 Channel', value: `<#${channel.id}>`, inline: true },
        { name: '💬 Message', value: announcement.length > 1024 ? announcement.substring(0, 1021) + '...' : announcement, inline: false }
      ]
    });
    
    return message.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Failed to send announcement:', error);
    return message.reply('❌ Failed to send the announcement. Please check my permissions and try again.');
  }
}

/**
 * Handle sending an embedded message
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleEmbed(client, message, args) {
  if (args.length < 2) {
    return message.reply('❌ Please specify a channel and embed content. Usage: `!admin embed <#channel> <title> | <description> | [imageURL]`');
  }
  
  // Get channel
  const channel = message.mentions.channels.first() || 
                 message.guild.channels.cache.get(args[0]);
  
  if (!channel) {
    return message.reply('❓ Could not find that channel. Please mention a channel or provide a valid channel ID.');
  }
  
  // Get embed content
  const embedContent = args.slice(1).join(' ');
  const contentParts = embedContent.split('|').map(part => part.trim());
  
  if (contentParts.length < 2) {
    return message.reply('❌ Please provide at least a title and description for the embed, separated by `|`. Usage: `!admin embed <#channel> <title> | <description> | [imageURL]`');
  }
  
  const title = contentParts[0];
  const description = contentParts[1];
  const imageUrl = contentParts[2] || null;
  
  try {
    // Create the embed
    const embed = createEmbed({
      title: title,
      description: description,
      color: COLORS.PRIMARY,
      image: imageUrl ? { url: imageUrl } : null
    });
    
    // Send the embed
    await channel.send({ embeds: [embed] });
    
    // Create success embed
    const successEmbed = createEmbed({
      title: '🖼️ Embed Sent',
      description: `✅ Successfully sent embedded message to ${channel}.`,
      color: COLORS.SUCCESS,
      fields: [
        { name: '📌 Channel', value: `<#${channel.id}>`, inline: true },
        { name: '📝 Title', value: title.length > 256 ? title.substring(0, 253) + '...' : title, inline: false },
        { name: '💬 Description', value: description.length > 256 ? description.substring(0, 253) + '...' : description, inline: false }
      ],
      footer: { text: imageUrl ? '🖼️ Includes an image' : '🔵 No image included' }
    });
    
    return message.reply({ embeds: [successEmbed] });
  } catch (error) {
    logger.error('Failed to send embed:', error);
    return message.reply('❌ Failed to send the embedded message. Please check my permissions and try again.');
  }
}

/**
 * Handle setting channel restrictions
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleSetChannel(client, message, args) {
  if (args.length < 2) {
    return message.reply('❌ Please specify a category and a channel. Usage: `!admin setchannel <category> <#channel>`');
  }
  
  const category = args[0].toLowerCase();
  const validCategories = ['economy', 'fun', 'games', 'general'];
  
  // Validate category
  if (!validCategories.includes(category)) {
    return message.reply(`❓ Invalid category. Valid categories are: ${validCategories.join(', ')}`);
  }
  
  // Check if removing restriction
  if (args[1].toLowerCase() === 'none') {
    await setRestrictedChannel(message.guild.id, category, null);
    
    return message.reply({
      embeds: [createEmbed({
        title: '🔓 Channel Restriction Removed',
        description: `✅ ${category.charAt(0).toUpperCase() + category.slice(1)} commands can now be used in any channel.`,
        color: COLORS.SUCCESS
      })]
    });
  }
  
  // Get channel
  const channel = message.mentions.channels.first() || 
                 message.guild.channels.cache.get(args[1]);
  
  if (!channel) {
    return message.reply('❓ Could not find that channel. Please mention a channel or provide a valid channel ID.');
  }
  
  // Update settings
  await setRestrictedChannel(message.guild.id, category, channel.id);
  
  // Create success embed
  const embed = createEmbed({
    title: '📌 Channel Restriction Set',
    description: `✅ ${category.charAt(0).toUpperCase() + category.slice(1)} commands will now only work in ${channel}.`,
    color: COLORS.SUCCESS,
    fields: [
      { name: '🔖 Category', value: category, inline: true },
      { name: '📌 Channel', value: `<#${channel.id}>`, inline: true }
    ],
    footer: { text: '💡 To remove this restriction, use !admin setchannel category none' }
  });
  
  return message.reply({ embeds: [embed] });
}

/**
 * Set moderation logs channel
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleSetModLogs(client, message, args) {
  if (!args.length) {
    return message.reply('❌ Please specify a channel. Usage: `!admin setmodlogs <#channel>`');
  }
  
  // Check if disabling mod logs
  if (args[0].toLowerCase() === 'none') {
    const settings = await getGuildSettings(message.guild.id);
    settings.moderationLogs = null;
    await updateGuildSettings(message.guild.id, settings);
    
    return message.reply({
      embeds: [createEmbed({
        title: '🔴 Moderation Logs Disabled',
        description: '✅ Moderation logs have been disabled.',
        color: COLORS.SUCCESS
      })]
    });
  }
  
  // Get channel
  const channel = message.mentions.channels.first() || 
                 message.guild.channels.cache.get(args[0]);
  
  if (!channel) {
    return message.reply('❓ Could not find that channel. Please mention a channel or provide a valid channel ID.');
  }
  
  // Update settings
  const settings = await getGuildSettings(message.guild.id);
  settings.moderationLogs = channel.id;
  await updateGuildSettings(message.guild.id, settings);
  
  // Create success embed
  const embed = createEmbed({
    title: '📜 Moderation Logs Set',
    description: `✅ Moderation logs will now be sent to ${channel}.`,
    color: COLORS.SUCCESS,
    fields: [
      { name: '📌 Channel', value: `<#${channel.id}>`, inline: true }
    ],
    footer: { text: '💡 To disable moderation logs, use !admin setmodlogs none' }
  });
  
  return message.reply({ embeds: [embed] });
}

/**
 * Handle customizing moderation messages
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleCustomMessage(client, message, args) {
  if (args.length < 2) {
    return message.reply('❌ Please specify a message type and custom message. Usage: `!admin custommessage <type> <message>`');
  }
  
  const type = args[0].toLowerCase();
  const validTypes = ['ban', 'mute', 'warn', 'timeout'];
  
  // Validate message type
  if (!validTypes.includes(type)) {
    return message.reply(`❓ Invalid message type. Valid types are: ${validTypes.join(', ')}`);
  }
  
  // Get custom message
  const customMessage = args.slice(1).join(' ');
  
  // Check if message is too long
  if (customMessage.length > 1000) {
    return message.reply('❌ Custom message is too long. Please keep it under 1000 characters.');
  }
  
  // Update settings
  const settings = await getGuildSettings(message.guild.id);
  
  // Initialize customMessages object if it doesn't exist
  if (!settings.customMessages) {
    settings.customMessages = {};
  }
  
  settings.customMessages[type] = customMessage;
  await updateGuildSettings(message.guild.id, settings);
  
  // Show available placeholders based on message type
  let placeholders;
  switch (type) {
    case 'ban':
      placeholders = '`{user}`, `{reason}`, `{moderator}`';
      break;
    case 'mute':
      placeholders = '`{user}`, `{reason}`, `{moderator}`';
      break;
    case 'warn':
      placeholders = '`{user}`, `{reason}`, `{moderator}`, `{warning_id}`, `{total_warnings}`';
      break;
    case 'timeout':
      placeholders = '`{user}`, `{reason}`, `{moderator}`, `{duration}`';
      break;
  }
  
  // Create success embed
  const embed = createEmbed({
    title: '💬 Custom Message Set',
    description: `✅ Custom message for **${type}** actions has been set.`,
    color: COLORS.SUCCESS,
    fields: [
      { name: '📝 Message Type', value: type, inline: true },
      { name: '💬 Custom Message', value: customMessage, inline: false },
      { name: '🔄 Available Placeholders', value: placeholders, inline: false }
    ],
    footer: { text: '💡 To reset this message, use !admin resetmessage type' }
  });
  
  return message.reply({ embeds: [embed] });
}

/**
 * Handle resetting custom moderation messages
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleResetMessage(client, message, args) {
  if (!args.length) {
    return message.reply('❌ Please specify a message type. Usage: `!admin resetmessage <type>`');
  }
  
  const type = args[0].toLowerCase();
  const validTypes = ['ban', 'mute', 'warn', 'timeout', 'all'];
  
  // Validate message type
  if (!validTypes.includes(type)) {
    return message.reply(`❓ Invalid message type. Valid types are: ${validTypes.join(', ')}`);
  }
  
  // Update settings
  const settings = await getGuildSettings(message.guild.id);
  
  // If no custom messages exist, nothing to reset
  if (!settings.customMessages) {
    return message.reply('ℹ️ There are no custom messages to reset.');
  }
  
  // Reset specific message type or all
  if (type === 'all') {
    settings.customMessages = {};
    await updateGuildSettings(message.guild.id, settings);
    
    return message.reply({
      embeds: [createEmbed({
        title: '🔄 All Custom Messages Reset',
        description: '✅ All custom moderation messages have been reset to default.',
        color: COLORS.SUCCESS
      })]
    });
  } else {
    // If this specific type doesn't exist, nothing to reset
    if (!settings.customMessages[type]) {
      return message.reply(`ℹ️ There is no custom message for **${type}** actions.`);
    }
    
    // Delete the specific custom message
    delete settings.customMessages[type];
    await updateGuildSettings(message.guild.id, settings);
    
    return message.reply({
      embeds: [createEmbed({
        title: '🔄 Custom Message Reset',
        description: `✅ Custom message for **${type}** actions has been reset to default.`,
        color: COLORS.SUCCESS
      })]
    });
  }
}

/**
 * Handle setting welcome channel and message
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleSetWelcome(client, message, args) {
  if (!args.length) {
    return message.reply('❌ Please specify a channel. Usage: `!admin setwelcome <#channel> [message]`');
  }
  
  // Get settings
  const settings = await getGuildSettings(message.guild.id);
  
  // Check if disabling welcome messages
  if (args[0].toLowerCase() === 'none') {
    settings.welcomeChannel = null;
    await updateGuildSettings(message.guild.id, settings);
    
    return message.reply({
      embeds: [createEmbed({
        title: '🔴 Welcome Messages Disabled',
        description: '✅ Welcome messages have been disabled.',
        color: COLORS.SUCCESS
      })]
    });
  }
  
  // Get channel
  const channel = message.mentions.channels.first() || 
                 message.guild.channels.cache.get(args[0]);
  
  if (!channel) {
    return message.reply('❓ Could not find that channel. Please mention a channel or provide a valid channel ID.');
  }
  
  // Get custom welcome message if provided
  if (args.length > 1) {
    const welcomeMessage = args.slice(1).join(' ');
    
    // Check if message is too long
    if (welcomeMessage.length > 1000) {
      return message.reply('❌ Welcome message is too long. Please keep it under 1000 characters.');
    }
    
    settings.welcomeMessage = welcomeMessage;
  }
  
  // Update channel
  settings.welcomeChannel = channel.id;
  await updateGuildSettings(message.guild.id, settings);
  
  // Create success embed
  const embed = createEmbed({
    title: '👋 Welcome Settings Updated',
    description: `✅ Welcome messages will now be sent to ${channel}.`,
    color: COLORS.SUCCESS,
    fields: [
      { name: '📌 Channel', value: `<#${channel.id}>`, inline: true },
      { name: '💬 Message', value: settings.welcomeMessage || 'Welcome to the server, {user}!', inline: false },
      { name: '🔄 Available Placeholders', value: '`{user}`, `{server}`, `{memberCount}`', inline: false }
    ],
    footer: { text: '💡 To disable welcome messages, use !admin setwelcome none' }
  });
  
  return message.reply({ embeds: [embed] });
}

/**
 * Handle welcome DM settings
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleWelcomeDM(client, message, args) {
  if (!args.length) {
    return message.reply('❌ Please specify on/off. Usage: `!admin welcomedm <on/off> [message]`');
  }
  
  // Get settings
  const settings = await getGuildSettings(message.guild.id);
  
  // Check if enabling or disabling welcome DMs
  const option = args[0].toLowerCase();
  if (option !== 'on' && option !== 'off') {
    return message.reply('❓ Invalid option. Please use `on` or `off`.');
  }
  
  settings.welcomeDmEnabled = (option === 'on');
  
  // Get custom welcome DM message if provided
  if (args.length > 1) {
    const welcomeDmMessage = args.slice(1).join(' ');
    
    // Check if message is too long
    if (welcomeDmMessage.length > 1000) {
      return message.reply('❌ Welcome DM message is too long. Please keep it under 1000 characters.');
    }
    
    settings.welcomeDmMessage = welcomeDmMessage;
  }
  
  await updateGuildSettings(message.guild.id, settings);
  
  // Create success embed
  const embed = createEmbed({
    title: '✉️ Welcome DM Settings Updated',
    description: `✅ Welcome DMs are now ${settings.welcomeDmEnabled ? '🟢 enabled' : '🔴 disabled'}.`,
    color: COLORS.SUCCESS,
    fields: settings.welcomeDmEnabled ? [
      { name: '💬 Message', value: settings.welcomeDmMessage || 'Welcome to {server}, {user}! We hope you enjoy your stay.', inline: false },
      { name: '🔄 Available Placeholders', value: '`{user}`, `{server}`, `{memberCount}`', inline: false }
    ] : []
  });
  
  return message.reply({ embeds: [embed] });
}

/**
 * Handle automod settings
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleAutomod(client, message, args) {
  if (args.length < 2) {
    return message.reply('❌ Please specify a setting and value. Usage: `!admin automod <setting> <value>`');
  }
  
  const setting = args[0].toLowerCase();
  const value = args[1].toLowerCase();
  
  // Validate setting
  const validSettings = ['enabled', 'profanity', 'mentions', 'emojis', 'spam'];
  if (!validSettings.includes(setting)) {
    return message.reply(`❓ Invalid automod setting. Valid settings are: ${validSettings.join(', ')}`);
  }
  
  // Get settings
  const settings = await getGuildSettings(message.guild.id);
  
  // Initialize automod object if it doesn't exist
  if (!settings.automod) {
    settings.automod = {
      enabled: false,
      filterProfanity: false,
      maxMentions: 5,
      maxEmojis: 10,
      antiSpam: false
    };
  }
  
  // Update setting based on type
  let successMessage = '';
  
  switch (setting) {
    case 'enabled':
      if (value !== 'on' && value !== 'off') {
        return message.reply('❓ Invalid value. Please use `on` or `off`.');
      }
      settings.automod.enabled = (value === 'on');
      successMessage = `Automod has been ${settings.automod.enabled ? '🟢 enabled' : '🔴 disabled'}.`;
      break;
      
    case 'profanity':
      if (value !== 'on' && value !== 'off') {
        return message.reply('❓ Invalid value. Please use `on` or `off`.');
      }
      settings.automod.filterProfanity = (value === 'on');
      successMessage = `Profanity filter has been ${settings.automod.filterProfanity ? '🟢 enabled' : '🔴 disabled'}.`;
      break;
      
    case 'mentions':
      const mentions = parseInt(value);
      if (isNaN(mentions) || mentions < 1) {
        return message.reply('❓ Invalid value. Please provide a positive number.');
      }
      settings.automod.maxMentions = mentions;
      successMessage = `Maximum mentions per message set to ${mentions}.`;
      break;
      
    case 'emojis':
      const emojis = parseInt(value);
      if (isNaN(emojis) || emojis < 1) {
        return message.reply('❓ Invalid value. Please provide a positive number.');
      }
      settings.automod.maxEmojis = emojis;
      successMessage = `Maximum emojis per message set to ${emojis}.`;
      break;
      
    case 'spam':
      if (value !== 'on' && value !== 'off') {
        return message.reply('❓ Invalid value. Please use `on` or `off`.');
      }
      settings.automod.antiSpam = (value === 'on');
      successMessage = `Anti-spam has been ${settings.automod.antiSpam ? '🟢 enabled' : '🔴 disabled'}.`;
      break;
  }
  
  await updateGuildSettings(message.guild.id, settings);
  
  // Create success embed
  const embed = createEmbed({
    title: '🤖 Automod Settings Updated',
    description: `✅ ${successMessage}`,
    color: COLORS.SUCCESS,
    fields: [
      { name: '⚙️ Setting', value: setting, inline: true },
      { name: '📝 Value', value: value, inline: true }
    ],
    footer: { text: '💡 Use !admin settings to view all settings' }
  });
  
  return message.reply({ embeds: [embed] });
}

/**
 * Show all current settings
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 */
async function showSettings(client, message) {
  // Get guild settings
  const settings = await getGuildSettings(message.guild.id);
  
  // Format restricted channels
  let restrictedChannelsText = '';
  
  for (const [category, channelId] of Object.entries(settings.restrictedChannels || {})) {
    if (channelId) {
      restrictedChannelsText += `• **${category.charAt(0).toUpperCase() + category.slice(1)}**: <#${channelId}>\n`;
    }
  }
  
  if (!restrictedChannelsText) {
    restrictedChannelsText = '🔓 No channel restrictions set';
  }
  
  // Format custom messages
  let customMessagesText = '';
  
  if (settings.customMessages) {
    for (const [type, message] of Object.entries(settings.customMessages)) {
      customMessagesText += `• **${type.charAt(0).toUpperCase() + type.slice(1)}**: ${message}\n`;
    }
  }
  
  if (!customMessagesText) {
    customMessagesText = '📝 No custom messages set';
  }
  
  // Create embed
  const embed = createEmbed({
    title: '⚙️ Server Settings',
    description: `Current settings for ${message.guild.name}`,
    color: COLORS.ADMIN,
    fields: [
      {
        name: '📌 Restricted Channels',
        value: restrictedChannelsText,
        inline: false
      },
      {
        name: '👋 Welcome Settings',
        value: 
          `• **Channel**: ${settings.welcomeChannel ? `<#${settings.welcomeChannel}>` : '🔴 Not set'}\n` +
          `• **Message**: ${settings.welcomeMessage || '📝 Default'}\n` +
          `• **DM Enabled**: ${settings.welcomeDmEnabled ? '🟢 Yes' : '🔴 No'}\n` +
          `• **DM Message**: ${settings.welcomeDmMessage || '📝 Default'}`,
        inline: false
      },
      {
        name: '🛡️ Moderation Settings',
        value: `• **Logs Channel**: ${settings.moderationLogs ? `<#${settings.moderationLogs}>` : '🔴 Not set'}`,
        inline: false
      },
      {
        name: '💬 Custom Moderation Messages',
        value: customMessagesText,
        inline: false
      },
      {
        name: '🤖 Automod Settings',
        value: 
          `• **Enabled**: ${settings.automod?.enabled ? '🟢 Yes' : '🔴 No'}\n` +
          `• **Filter Profanity**: ${settings.automod?.filterProfanity ? '🟢 Yes' : '🔴 No'}\n` +
          `• **Max Mentions**: ${settings.automod?.maxMentions || '🔴 Not set'}\n` +
          `• **Max Emojis**: ${settings.automod?.maxEmojis || '🔴 Not set'}\n` +
          `• **Anti Spam**: ${settings.automod?.antiSpam ? '🟢 Enabled' : '🔴 Disabled'}`,
        inline: false
      }
    ],
    footer: { text: '💡 Use !admin commands to modify these settings' }
  });
  
  return message.reply({ embeds: [embed] });
} 