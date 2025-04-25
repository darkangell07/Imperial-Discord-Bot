import { disableBot, markBotOffline } from '../../utils/bot-status.js';
import { logger } from '../../utils/logger.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the shutdown request
    logger.info('Shutdown requested from dashboard');
    
    // For serverless, we disable the bot and mark it as offline
    disableBot();
    markBotOffline();
    
    const message = "Bot has been shut down. In a serverless environment, this disables the bot until manually restarted.";
    
    return res.status(200).json({ 
      success: true, 
      message: message
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during shutdown' 
    });
  }
} 