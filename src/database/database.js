import { logger } from '../utils/logger.js';

// Simple in-memory database
const db = {
  guildSettings: new Map(),
  users: new Map()
};

/**
 * Get guild settings, create default if not exists
 * @param {string} guildId - Discord guild ID
 * @returns {Object} Guild settings
 */
export async function getGuildSettings(guildId) {
  try {
    let settings = db.guildSettings.get(guildId);
    
    if (!settings) {
      settings = {
        guildId,
        prefix: '!',
        welcomeChannel: null,
        welcomeMessage: 'Welcome to the server, {user}!',
        welcomeDmEnabled: false,
        welcomeDmMessage: 'Welcome to {server}, {user}! We hope you enjoy your stay.',
        restrictedChannels: {
          economy: null,
          games: null,
          fun: null,
          general: null
        },
        moderationLogs: null,
        automod: {
          enabled: false,
          filterProfanity: false,
          maxMentions: 5,
          maxEmojis: 10,
          antiSpam: false
        }
      };
      
      db.guildSettings.set(guildId, settings);
      logger.info(`Created default settings for guild: ${guildId}`);
    }
    
    return settings;
  } catch (error) {
    logger.error(`Error getting guild settings for ${guildId}:`, error);
    return {
      prefix: '!',
      welcomeChannel: null,
      welcomeMessage: 'Welcome to the server, {user}!',
      welcomeDmEnabled: false,
      welcomeDmMessage: 'Welcome to {server}, {user}! We hope you enjoy your stay.',
      restrictedChannels: {
        economy: null,
        games: null,
        fun: null,
        general: null
      },
      moderationLogs: null,
      automod: {
        enabled: false,
        filterProfanity: false,
        maxMentions: 5,
        maxEmojis: 10,
        antiSpam: false
      }
    };
  }
}

/**
 * Update guild settings
 * @param {string} guildId - Discord guild ID
 * @param {Object} settings - Settings to update
 * @returns {Object} Updated guild settings
 */
export async function updateGuildSettings(guildId, settings) {
  try {
    db.guildSettings.set(guildId, settings);
    logger.info(`Updated settings for guild: ${guildId}`);
    return settings;
  } catch (error) {
    logger.error(`Error updating guild settings for ${guildId}:`, error);
    throw error;
  }
}

/**
 * Get user data, create if not exists
 * @param {string} userId - Discord user ID
 * @param {string} guildId - Discord guild ID
 * @returns {Object} User data
 */
export async function getUser(userId, guildId) {
  const key = `${guildId}-${userId}`;
  let userData = db.users.get(key);
  
  if (!userData) {
    userData = {
      userId,
      guildId,
      balance: 100,
      bank: 0,
      lastDaily: null,
      lastWork: null,
      inventory: [],
      experience: 0,
      level: 1,
      warnings: [],
      job: {
        title: null,
        salary: 0,
        description: null
      }
    };
    
    db.users.set(key, userData);
  }
  
  return userData;
}

/**
 * Update user data
 * @param {string} userId - Discord user ID
 * @param {string} guildId - Discord guild ID
 * @param {Object} data - Data to update
 * @returns {Object} Updated user data
 */
export async function updateUser(userId, guildId, data) {
  const key = `${guildId}-${userId}`;
  db.users.set(key, data);
  return data;
}

/**
 * Set channel restriction for a category
 * @param {string} guildId - Discord guild ID
 * @param {string} category - Command category 
 * @param {string} channelId - Channel ID or null to remove restriction
 * @returns {Object} Updated guild settings
 */
export async function setRestrictedChannel(guildId, category, channelId) {
  try {
    // Validate category
    const validCategories = ['economy', 'games', 'fun', 'general'];
    if (!validCategories.includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }
    
    const settings = await getGuildSettings(guildId);
    
    // Update the settings
    if (!settings.restrictedChannels) {
      settings.restrictedChannels = {};
    }
    
    settings.restrictedChannels[category] = channelId;
    
    // Save the updated settings
    return await updateGuildSettings(guildId, settings);
  } catch (error) {
    logger.error(`Error setting restricted channel for ${guildId}:`, error);
    throw error;
  }
}

/**
 * Set welcome channel and message
 * @param {string} guildId - Discord guild ID
 * @param {string} channelId - Welcome channel ID
 * @param {string} message - Welcome message
 * @returns {Object} Updated guild settings
 */
export async function setWelcomeChannel(guildId, channelId, message) {
  try {
    const settings = await getGuildSettings(guildId);
    
    settings.welcomeChannel = channelId;
    if (message) {
      settings.welcomeMessage = message;
    }
    
    return await updateGuildSettings(guildId, settings);
  } catch (error) {
    logger.error(`Error setting welcome channel for ${guildId}:`, error);
    throw error;
  }
}

/**
 * Set welcome DM message
 * @param {string} guildId - Discord guild ID
 * @param {boolean} enabled - Whether welcome DMs are enabled
 * @param {string} message - Welcome DM message
 * @returns {Object} Updated guild settings
 */
export async function setWelcomeDm(guildId, enabled, message) {
  try {
    const settings = await getGuildSettings(guildId);
    
    settings.welcomeDmEnabled = enabled;
    if (message) {
      settings.welcomeDmMessage = message;
    }
    
    return await updateGuildSettings(guildId, settings);
  } catch (error) {
    logger.error(`Error setting welcome DM for ${guildId}:`, error);
    throw error;
  }
}

// Exports
export const database = {
  db,
  getGuildSettings,
  updateGuildSettings,
  getUser,
  updateUser,
  setRestrictedChannel,
  setWelcomeChannel,
  setWelcomeDm
}; 