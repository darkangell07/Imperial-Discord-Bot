import { getBotStatus } from '../../utils/bot-status.js';
import { logger } from '../../utils/logger.js';
import moment from 'moment';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the bot status from our utility
    const statusData = getBotStatus();
    
    // Format data for display
    const formattedStatus = {
      status: statusData.status.charAt(0).toUpperCase() + statusData.status.slice(1),
      lastActive: statusData.lastActive ? moment(statusData.lastActive).fromNow() : 'Never',
      commandsUsed: statusData.commands,
      serverCount: statusData.servers,
      uptime: statusData.lastRestart ? moment(statusData.lastRestart).fromNow(true) : 'Unknown',
      isDisabled: statusData.isDisabled
    };
    
    return res.status(200).json(formattedStatus);
  } catch (error) {
    logger.error('Error getting bot status:', error);
    return res.status(500).json({ 
      status: 'Error', 
      message: 'Failed to retrieve bot status' 
    });
  }
} 