import { enableBot, markBotOnline } from '../../utils/bot-status.js';
import { logger } from '../../utils/logger.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the restart request
    logger.info('Restart requested from dashboard');
    
    // For serverless, we enable the bot and mark it as online
    enableBot();
    markBotOnline();
    
    const message = "Bot has been restarted. In a serverless environment, this resets the status and enables the bot.";
    
    return res.status(200).json({ 
      success: true, 
      message: message
    });
  } catch (error) {
    logger.error('Error during restart:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during restart' 
    });
  }
} 