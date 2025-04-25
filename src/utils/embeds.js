import { EmbedBuilder } from 'discord.js';

// Define colors
export const COLORS = {
  PRIMARY: 0x5865F2,     // Discord Blurple
  SUCCESS: 0x57F287,     // Green
  ERROR: 0xED4245,       // Red
  WARNING: 0xFEE75C,     // Yellow
  ECONOMY: 0xF1C40F,     // Gold
  MODERATION: 0x7289DA,  // Light Blurple
  ADMIN: 0xE91E63,       // Pink
  GAMES: 0x9B59B6,       // Purple
  INFO: 0x3498DB         // Blue
};

/**
 * Create a standard embed with consistent styling
 * @param {Object} options - Embed options
 * @returns {EmbedBuilder} Discord embed
 */
export function createEmbed(options = {}) {
  const embed = new EmbedBuilder()
    .setColor(options.color || COLORS.PRIMARY);
  
  if (options.title) {
    // Add emoji prefix based on color
    let emojiPrefix = '';
    
    if (options.color === COLORS.SUCCESS) emojiPrefix = '✅ ';
    else if (options.color === COLORS.ERROR) emojiPrefix = '❌ ';
    else if (options.color === COLORS.WARNING) emojiPrefix = '⚠️ ';
    else if (options.color === COLORS.ECONOMY) emojiPrefix = '💰 ';
    else if (options.color === COLORS.MODERATION) emojiPrefix = '🛡️ ';
    else if (options.color === COLORS.ADMIN) emojiPrefix = '⚙️ ';
    else if (options.color === COLORS.GAMES) emojiPrefix = '🎮 ';
    else if (options.color === COLORS.INFO) emojiPrefix = 'ℹ️ ';
    
    embed.setTitle(`${emojiPrefix}${options.title}`);
  }
  
  if (options.description) {
    embed.setDescription(options.description);
  }
  
  if (options.thumbnail) {
    embed.setThumbnail(options.thumbnail);
  }
  
  if (options.image) {
    embed.setImage(options.image);
  }
  
  if (options.author) {
    embed.setAuthor(options.author);
  }
  
  if (options.fields && options.fields.length > 0) {
    embed.addFields(options.fields);
  }
  
  if (options.footer) {
    // Add timestamp to footer
    embed.setFooter(options.footer);
    embed.setTimestamp();
  }
  
  return embed;
}

/**
 * Create a help menu embed with consistent styling
 * @param {Object} options - Help embed options
 * @returns {EmbedBuilder} Discord embed
 */
export function helpEmbed(options = {}) {
  const embed = createEmbed({
    title: options.title || 'Help Menu',
    description: options.description || 'Here are the available commands:',
    color: COLORS.INFO,
    fields: options.commands || [],
    footer: options.footer || { text: 'Use !help [command] for more information on a specific command' }
  });
  
  // Add bot icon as thumbnail
  if (!options.thumbnail && options.client) {
    embed.setThumbnail(options.client.user.displayAvatarURL({ dynamic: true }));
  }
  
  return embed;
}

/**
 * Create a simple error embed
 * @param {string} message - Error message
 * @returns {EmbedBuilder} Discord embed
 */
export function errorEmbed(message) {
  return createEmbed({
    title: 'Error',
    description: message,
    color: COLORS.ERROR,
    footer: { text: 'If this error persists, please contact a server administrator' }
  });
}

/**
 * Create a simple success embed
 * @param {string} message - Success message
 * @returns {EmbedBuilder} Discord embed
 */
export function successEmbed(message) {
  return createEmbed({
    title: 'Success',
    description: message,
    color: COLORS.SUCCESS,
    footer: { text: 'Imperial Bot' }
  });
}

/**
 * Create a loading embed for long operations
 * @param {string} message - Loading message
 * @returns {EmbedBuilder} Discord embed
 */
export function loadingEmbed(message = 'Processing your request...') {
  return createEmbed({
    title: 'Please Wait',
    description: `⏳ ${message}`,
    color: COLORS.PRIMARY,
    footer: { text: 'This may take a moment' }
  });
}

/**
 * Create a confirmation embed for actions that need confirmation
 * @param {string} message - Confirmation message
 * @param {string} action - Action being confirmed
 * @returns {EmbedBuilder} Discord embed
 */
export function confirmEmbed(message, action = 'this action') {
  return createEmbed({
    title: 'Confirmation Required',
    description: `${message}\n\nReact with ✅ to confirm or ❌ to cancel ${action}.`,
    color: COLORS.WARNING,
    footer: { text: 'This confirmation will expire in 30 seconds' }
  });
}