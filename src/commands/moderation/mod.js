import { PermissionFlagsBits, ChannelType } from 'discord.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { getGuildSettings, getUser, updateUser } from '../../database/database.js';

// Developer user ID with all permissions
const DEVELOPER_ID = '918152747377905675';

export default {
  name: 'mod',
  category: 'moderation',
  description: 'Advanced moderation commands',
  usage: '!mod <option> <@user/channel> [reason/duration]',
  permissions: [
    PermissionFlagsBits.ModerateMembers
  ],
  hidden: true, // This will hide it from the help command
  cooldown: 3,
  async execute(client, message, args) {
    try {
      if (!args.length) {
        return showModHelp(client, message);
      }
      
      const option = args[0].toLowerCase();
      
      // Handle different moderation options
      switch (option) {
        case 'ban':
          // Check ban permission
          if (message.author.id !== DEVELOPER_ID && 
              !message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply({
              embeds: [createEmbed({
                title: 'Permission Denied',
                description: 'You need the Ban Members permission to use this command.',
                color: COLORS.ERROR
              })]
            });
          }
          return handleBan(client, message, args.slice(1));
        
        case 'mute':
          // Check mute permission
          if (message.author.id !== DEVELOPER_ID && 
              !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply({
              embeds: [createEmbed({
                title: 'Permission Denied',
                description: 'You need the Moderate Members permission to use this command.',
                color: COLORS.ERROR
              })]
            });
          }
          return handleMute(client, message, args.slice(1));
        
        case 'warn':
          // Check warn permission (requires ModerateMembers)
          if (message.author.id !== DEVELOPER_ID && 
              !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply({
              embeds: [createEmbed({
                title: 'Permission Denied',
                description: 'You need the Moderate Members permission to use this command.',
                color: COLORS.ERROR
              })]
            });
          }
          return handleWarn(client, message, args.slice(1));
        
        case 'timeout':
          // Check timeout permission
          if (message.author.id !== DEVELOPER_ID && 
              !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply({
              embeds: [createEmbed({
                title: 'Permission Denied',
                description: 'You need the Moderate Members permission to use this command.',
                color: COLORS.ERROR
              })]
            });
          }
          return handleTimeout(client, message, args.slice(1));
        
        case 'slowmode':
          // Check slowmode permission
          if (message.author.id !== DEVELOPER_ID && 
              !message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply({
              embeds: [createEmbed({
                title: 'Permission Denied',
                description: 'You need the Manage Channels permission to use this command.',
                color: COLORS.ERROR
              })]
            });
          }
          return handleSlowmode(client, message, args.slice(1));
        
        case 'warnings':
          // Check warnings permission
          if (message.author.id !== DEVELOPER_ID && 
              !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            return message.reply({
              embeds: [createEmbed({
                title: 'Permission Denied',
                description: 'You need the Moderate Members permission to use this command.',
                color: COLORS.ERROR
              })]
            });
          }
          return handleWarnings(client, message, args.slice(1));
        
        default:
          return message.reply(`Unknown moderation option: \`${option}\`. Use \`!mod\` to see available options.`);
      }
    } catch (error) {
      logger.error('Error in mod command:', error);
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
 * Display moderation help information
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 */
async function showModHelp(client, message) {
  const embed = createEmbed({
    title: '🛡️ Moderation Command Help',
    description: '👮‍♂️ Advanced moderation commands for server staff. These commands require appropriate permissions.',
    color: COLORS.MODERATION,
    fields: [
      {
        name: '⛔ !mod ban <@user> [reason]',
        value: 'Ban a user from the server\nExample: `!mod ban @User Breaking server rules`',
        inline: false
      },
      {
        name: '🔇 !mod mute <@user> [reason]',
        value: 'Mute a user (prevents them from sending messages)\nExample: `!mod mute @User Spamming`',
        inline: false
      },
      {
        name: '⏱️ !mod timeout <@user> <duration> [reason]',
        value: 'Timeout a user for a specific duration\nDuration format: 1m, 1h, 1d (minutes, hours, days)\nExample: `!mod timeout @User 2h Inappropriate behavior`',
        inline: false
      },
      {
        name: '⚠️ !mod warn <@user> [reason]',
        value: 'Issue a warning to a user\nExample: `!mod warn @User First warning for spamming`',
        inline: false
      },
      {
        name: '📋 !mod warnings <@user>',
        value: 'View warnings for a user\nExample: `!mod warnings @User`',
        inline: false
      },
      {
        name: '🕒 !mod slowmode <#channel> <seconds>',
        value: 'Set slowmode for a channel (0 to disable)\nExample: `!mod slowmode #general 5`',
        inline: false
      }
    ],
    footer: { text: '🔒 Moderation commands are hidden from regular users' }
  });
  
  return message.reply({ embeds: [embed] });
}

/**
 * Format a custom message with placeholders
 * @param {string} message - The message template
 * @param {Object} data - Data to fill the placeholders
 * @returns {string} Formatted message
 */
function formatCustomMessage(message, data) {
  let formattedMessage = message;
  
  // Replace placeholders
  for (const [key, value] of Object.entries(data)) {
    formattedMessage = formattedMessage.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  
  return formattedMessage;
}

/**
 * Handle banning a user
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleBan(client, message, args) {
  if (!args.length) {
    return message.reply('❌ Please mention a user to ban. Usage: `!mod ban <@user> [reason]`');
  }
  
  // Get target user
  const target = message.mentions.members.first() || 
                await message.guild.members.fetch(args[0]).catch(() => null);
  
  if (!target) {
    return message.reply('❓ Could not find that user.');
  }
  
  // Check if the user is bannable
  if (!target.bannable) {
    return message.reply('⚠️ I cannot ban this user. They may have a higher role than me, or I don\'t have ban permissions.');
  }
  
  // Get ban reason
  const reason = args.slice(1).join(' ') || 'No reason provided';
  
  try {
    // Ban the user
    await target.ban({ reason: `${message.author.tag}: ${reason}` });
    
    // Get guild settings for custom messages
    const guildSettings = await getGuildSettings(message.guild.id);
    
    // Create custom or default description
    let description;
    if (guildSettings.customMessages?.ban) {
      description = formatCustomMessage(guildSettings.customMessages.ban, {
        user: target.user.tag,
        reason: reason,
        moderator: message.author.tag
      });
    } else {
      description = `⛔ **${target.user.tag}** has been banned from the server.`;
    }
    
    // Create success embed
    const embed = createEmbed({
      title: '⛔ User Banned',
      description: description,
      color: COLORS.MODERATION,
      thumbnail: target.user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: '📝 Reason', value: reason, inline: false },
        { name: '👮‍♂️ Moderator', value: message.author.tag, inline: false }
      ],
      footer: { text: `🆔 User ID: ${target.id}` }
    });
    
    // Log the ban if moderation logs are enabled
    if (guildSettings.moderationLogs) {
      const logChannel = message.guild.channels.cache.get(guildSettings.moderationLogs);
      if (logChannel) {
        logChannel.send({ embeds: [embed] }).catch(err => {
          logger.error('Failed to send to moderation logs:', err);
        });
      }
    }
    
    return message.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Failed to ban user:', error);
    return message.reply('❌ Failed to ban the user. Please check my permissions and try again.');
  }
}

/**
 * Handle muting a user
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleMute(client, message, args) {
  if (!args.length) {
    return message.reply('❌ Please mention a user to mute. Usage: `!mod mute <@user> [reason]`');
  }
  
  // Get target user
  const target = message.mentions.members.first() || 
                await message.guild.members.fetch(args[0]).catch(() => null);
  
  if (!target) {
    return message.reply('❓ Could not find that user.');
  }
  
  // Check if the user is muteable
  if (!target.manageable) {
    return message.reply('⚠️ I cannot mute this user. They may have a higher role than me, or I don\'t have permissions.');
  }
  
  // Get reason
  const reason = args.slice(1).join(' ') || 'No reason provided';
  
  try {
    // Apply timeout for 24 hours (Discord's implementation of mute)
    await target.timeout(24 * 60 * 60 * 1000, reason);
    
    // Get guild settings for custom messages
    const guildSettings = await getGuildSettings(message.guild.id);
    
    // Create custom or default description
    let description;
    if (guildSettings.customMessages?.mute) {
      description = formatCustomMessage(guildSettings.customMessages.mute, {
        user: target.user.tag,
        reason: reason,
        moderator: message.author.tag
      });
    } else {
      description = `🔇 **${target.user.tag}** has been muted for 24 hours.`;
    }
    
    // Create success embed
    const embed = createEmbed({
      title: '🔇 User Muted',
      description: description,
      color: COLORS.MODERATION,
      thumbnail: target.user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: '📝 Reason', value: reason, inline: false },
        { name: '👮‍♂️ Moderator', value: message.author.tag, inline: false }
      ],
      footer: { text: `🆔 User ID: ${target.id}` }
    });
    
    // Log the mute if moderation logs are enabled
    if (guildSettings.moderationLogs) {
      const logChannel = message.guild.channels.cache.get(guildSettings.moderationLogs);
      if (logChannel) {
        logChannel.send({ embeds: [embed] }).catch(err => {
          logger.error('Failed to send to moderation logs:', err);
        });
      }
    }
    
    return message.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Failed to mute user:', error);
    return message.reply('❌ Failed to mute the user. Please check my permissions and try again.');
  }
}

/**
 * Handle timeout for a user
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleTimeout(client, message, args) {
  if (args.length < 2) {
    return message.reply('❌ Please mention a user and specify a duration. Usage: `!mod timeout <@user> <duration> [reason]`');
  }
  
  // Get target user
  const target = message.mentions.members.first() || 
                await message.guild.members.fetch(args[0]).catch(() => null);
  
  if (!target) {
    return message.reply('❓ Could not find that user.');
  }
  
  // Check if the user can be timed out
  if (!target.manageable) {
    return message.reply('⚠️ I cannot timeout this user. They may have a higher role than me, or I don\'t have permissions.');
  }
  
  // Parse duration
  const durationArg = args[1].toLowerCase();
  let duration = 0;
  
  if (durationArg.endsWith('m')) {
    duration = parseInt(durationArg) * 60 * 1000; // minutes
  } else if (durationArg.endsWith('h')) {
    duration = parseInt(durationArg) * 60 * 60 * 1000; // hours
  } else if (durationArg.endsWith('d')) {
    duration = parseInt(durationArg) * 24 * 60 * 60 * 1000; // days
  } else {
    return message.reply('❌ Invalid duration format. Use formats like 5m, 2h, or 1d for minutes, hours, or days.');
  }
  
  // Check duration limits (max 28 days per Discord's limit)
  if (duration < 60000 || duration > 28 * 24 * 60 * 60 * 1000) {
    return message.reply('⚠️ Duration must be between 1 minute and 28 days.');
  }
  
  // Get reason
  const reason = args.slice(2).join(' ') || 'No reason provided';
  
  try {
    // Apply timeout
    await target.timeout(duration, reason);
    
    // Format duration for display
    let durationText = '';
    const days = Math.floor(duration / (24 * 60 * 60 * 1000));
    const hours = Math.floor((duration % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) durationText += `${days} day${days !== 1 ? 's' : ''} `;
    if (hours > 0) durationText += `${hours} hour${hours !== 1 ? 's' : ''} `;
    if (minutes > 0) durationText += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    
    durationText = durationText.trim();
    
    // Get guild settings for custom messages
    const guildSettings = await getGuildSettings(message.guild.id);
    
    // Create custom or default description
    let description;
    if (guildSettings.customMessages?.timeout) {
      description = formatCustomMessage(guildSettings.customMessages.timeout, {
        user: target.user.tag,
        reason: reason,
        moderator: message.author.tag,
        duration: durationText
      });
    } else {
      description = `⏱️ **${target.user.tag}** has been timed out for ${durationText}.`;
    }
    
    // Create success embed
    const embed = createEmbed({
      title: '⏱️ User Timed Out',
      description: description,
      color: COLORS.MODERATION,
      thumbnail: target.user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: '⏳ Duration', value: durationText, inline: true },
        { name: '📝 Reason', value: reason, inline: true },
        { name: '👮‍♂️ Moderator', value: message.author.tag, inline: false }
      ],
      footer: { text: `🆔 User ID: ${target.id}` }
    });
    
    // Log the timeout if moderation logs are enabled
    if (guildSettings.moderationLogs) {
      const logChannel = message.guild.channels.cache.get(guildSettings.moderationLogs);
      if (logChannel) {
        logChannel.send({ embeds: [embed] }).catch(err => {
          logger.error('Failed to send to moderation logs:', err);
        });
      }
    }
    
    return message.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Failed to timeout user:', error);
    return message.reply('❌ Failed to timeout the user. Please check my permissions and try again.');
  }
}

/**
 * Handle warning a user
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleWarn(client, message, args) {
  if (!args.length) {
    return message.reply('❌ Please mention a user to warn. Usage: `!mod warn <@user> [reason]`');
  }
  
  // Get target user
  const target = message.mentions.members.first() || 
                await message.guild.members.fetch(args[0]).catch(() => null);
  
  if (!target) {
    return message.reply('❓ Could not find that user.');
  }
  
  // Get reason
  const reason = args.slice(1).join(' ') || 'No reason provided';
  
  try {
    // Get user data
    const userData = await getUser(target.id, message.guild.id);
    
    // Create warning object
    const warning = {
      id: userData.warnings ? userData.warnings.length + 1 : 1,
      reason,
      moderator: message.author.id,
      moderatorTag: message.author.tag,
      timestamp: Date.now()
    };
    
    // Add warning to user data
    if (!userData.warnings) {
      userData.warnings = [];
    }
    
    userData.warnings.push(warning);
    
    // Update user data
    await updateUser(target.id, message.guild.id, userData);
    
    // Get guild settings for custom messages
    const guildSettings = await getGuildSettings(message.guild.id);
    
    // Create custom or default description
    let description;
    if (guildSettings.customMessages?.warn) {
      description = formatCustomMessage(guildSettings.customMessages.warn, {
        user: target.user.tag,
        reason: reason,
        moderator: message.author.tag,
        warning_id: warning.id,
        total_warnings: userData.warnings.length
      });
    } else {
      description = `⚠️ **${target.user.tag}** has been warned.`;
    }
    
    // Create success embed
    const embed = createEmbed({
      title: '⚠️ User Warned',
      description: description,
      color: COLORS.MODERATION,
      thumbnail: target.user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: '🔢 Warning ID', value: `#${warning.id}`, inline: true },
        { name: '📝 Reason', value: reason, inline: true },
        { name: '📊 Total Warnings', value: `${userData.warnings.length}`, inline: true },
        { name: '👮‍♂️ Moderator', value: message.author.tag, inline: false }
      ],
      footer: { text: `🆔 User ID: ${target.id}` }
    });
    
    // Log the warning if moderation logs are enabled
    if (guildSettings.moderationLogs) {
      const logChannel = message.guild.channels.cache.get(guildSettings.moderationLogs);
      if (logChannel) {
        logChannel.send({ embeds: [embed] }).catch(err => {
          logger.error('Failed to send to moderation logs:', err);
        });
      }
    }
    
    return message.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Failed to warn user:', error);
    return message.reply('❌ Failed to warn the user. Please try again later.');
  }
}

/**
 * Handle setting slowmode for a channel
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleSlowmode(client, message, args) {
  if (args.length < 2) {
    return message.reply('❌ Please specify a channel and slowmode duration in seconds. Usage: `!mod slowmode <#channel> <seconds>`');
  }
  
  // Get channel
  const channel = message.mentions.channels.first() || 
                 message.guild.channels.cache.get(args[0]);
  
  if (!channel) {
    return message.reply('❓ Could not find that channel. Please mention a channel or provide a valid channel ID.');
  }
  
  // Check if channel is a text channel
  if (channel.type !== ChannelType.GuildText) {
    return message.reply('⚠️ Slowmode can only be set for text channels.');
  }
  
  // Parse slowmode duration
  const seconds = parseInt(args[1]);
  
  if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
    return message.reply('⚠️ Slowmode must be between 0 and 21600 seconds (6 hours).');
  }
  
  try {
    // Set slowmode
    await channel.setRateLimitPerUser(seconds);
    
    // Create success embed
    const embed = createEmbed({
      title: '🕒 Slowmode Set',
      description: seconds === 0 
        ? `✅ Slowmode has been disabled in ${channel}.`
        : `✅ Slowmode has been set to ${seconds} seconds in ${channel}.`,
      color: COLORS.MODERATION,
      fields: [
        { name: '📌 Channel', value: `<#${channel.id}>`, inline: true },
        { name: '⏱️ Slowmode', value: seconds === 0 ? '🔄 Disabled' : `${seconds} seconds`, inline: true },
        { name: '👮‍♂️ Moderator', value: message.author.tag, inline: false }
      ],
      footer: { text: `🆔 Channel ID: ${channel.id}` }
    });
    
    // Log the slowmode change if moderation logs are enabled
    const guildSettings = await getGuildSettings(message.guild.id);
    if (guildSettings.moderationLogs) {
      const logChannel = message.guild.channels.cache.get(guildSettings.moderationLogs);
      if (logChannel && logChannel.id !== channel.id) { // Don't log to the same channel
        logChannel.send({ embeds: [embed] }).catch(err => {
          logger.error('Failed to send to moderation logs:', err);
        });
      }
    }
    
    return message.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Failed to set slowmode:', error);
    return message.reply('❌ Failed to set slowmode for the channel. Please check my permissions and try again.');
  }
}

/**
 * Handle viewing warnings for a user
 * @param {Object} client - Discord client
 * @param {Object} message - Message object
 * @param {Array} args - Command arguments
 */
async function handleWarnings(client, message, args) {
  if (!args.length) {
    return message.reply('❌ Please mention a user to view warnings. Usage: `!mod warnings <@user>`');
  }
  
  // Get target user
  const target = message.mentions.users.first() || 
                await message.client.users.fetch(args[0]).catch(() => null);
  
  if (!target) {
    return message.reply('❓ Could not find that user.');
  }
  
  try {
    // Get user data
    const userData = await getUser(target.id, message.guild.id);
    
    if (!userData.warnings || userData.warnings.length === 0) {
      return message.reply({
        embeds: [createEmbed({
          title: '📋 User Warnings',
          description: `✅ **${target.tag}** has no warnings.`,
          color: COLORS.MODERATION,
          thumbnail: target.displayAvatarURL({ dynamic: true }),
          footer: { text: `🆔 User ID: ${target.id}` }
        })]
      });
    }
    
    // Sort warnings by timestamp (newest first)
    const sortedWarnings = [...userData.warnings].sort((a, b) => b.timestamp - a.timestamp);
    
    // Format warnings
    const warningFields = sortedWarnings.map(warning => {
      const date = new Date(warning.timestamp);
      return {
        name: `⚠️ Warning #${warning.id} - ${date.toLocaleDateString()}`,
        value: `📝 **Reason**: ${warning.reason}\n👮‍♂️ **Moderator**: ${warning.moderatorTag}`,
        inline: false
      };
    });
    
    // Create embed
    const embed = createEmbed({
      title: '📋 User Warnings',
      description: `⚠️ **${target.tag}** has ${userData.warnings.length} warning(s).`,
      color: COLORS.MODERATION,
      thumbnail: target.displayAvatarURL({ dynamic: true }),
      fields: warningFields,
      footer: { text: `🆔 User ID: ${target.id}` }
    });
    
    return message.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Failed to get warnings:', error);
    return message.reply('❌ Failed to retrieve warnings for the user. Please try again later.');
  }
} 