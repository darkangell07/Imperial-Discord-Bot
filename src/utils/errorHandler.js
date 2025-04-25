import { errorEmbed, COLORS } from './embeds.js';
import { logger } from './logger.js';

/**
 * Handle command errors with proper user feedback
 * @param {Error} error - The error object
 * @param {Message} message - Discord message object
 * @param {string} command - Command name
 */
export async function handleCommandError(error, message, command) {
  logger.error(`Error executing ${command} command:`, error);
  
  // Determine error type and message
  let errorMessage = 'There was an error executing that command. Please try again later.';
  
  if (error.message.includes('permissions')) {
    errorMessage = 'I don\'t have the required permissions to perform this action.';
  } else if (error.message.includes('rate limit')) {
    errorMessage = 'I\'m being rate limited. Please try again in a few seconds.';
  } else if (error.message.includes('Unknown Message')) {
    // Message was deleted, silently fail
    return;
  } else if (error.code === 50013) {
    errorMessage = 'I don\'t have permission to do that. Please check my role permissions.';
  }
  
  // Create error embed
  const embed = errorEmbed(errorMessage);
  
  // Add error details in development environments
  if (process.env.NODE_ENV === 'development') {
    embed.addFields({
      name: 'Error Details (Dev Only)',
      value: `\`\`\`${error.message}\`\`\``,
      inline: false
    });
  }
  
  // Send error message
  try {
    await message.reply({ embeds: [embed] });
  } catch (err) {
    // Fallback if we can't reply with an embed
    try {
      await message.channel.send({ 
        content: `Error executing command: ${errorMessage}`,
      });
    } catch (finalError) {
      logger.error('Failed to send error message:', finalError);
    }
  }
}

/**
 * Handle Discord API errors with proper user feedback
 * @param {Error} error - The error object
 * @param {Message} message - Discord message object
 * @param {string} action - Action being performed
 */
export async function handleApiError(error, message, action = 'performing that action') {
  logger.error(`API Error during ${action}:`, error);
  
  // Create error embed
  const embed = errorEmbed(`There was an error ${action}. Please try again later.`);
  
  // Send error message
  try {
    await message.reply({ embeds: [embed] });
  } catch (err) {
    logger.error('Failed to send API error message:', err);
  }
} 