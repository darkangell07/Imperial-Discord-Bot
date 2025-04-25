// Bot status tracking utility
// This file helps maintain a record of the bot's status across serverless function calls

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to status file (in /tmp for serverless environment)
const STATUS_FILE = process.env.NODE_ENV === 'production' 
  ? '/tmp/bot-status.json' 
  : path.join(__dirname, '../../data/bot-status.json');

// Default status data
const defaultStatus = {
  status: 'offline',
  lastActive: null,
  commands: 0,
  servers: 0,
  uptime: 0,
  isDisabled: false,
  lastRestart: null
};

// Ensure the directory exists
function ensureDirectoryExists() {
  const dir = path.dirname(STATUS_FILE);
  if (process.env.NODE_ENV !== 'production' && !fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Get current status
export function getBotStatus() {
  try {
    ensureDirectoryExists();
    
    if (!fs.existsSync(STATUS_FILE)) {
      // Create default status file if it doesn't exist
      fs.writeFileSync(STATUS_FILE, JSON.stringify(defaultStatus));
      return { ...defaultStatus };
    }
    
    const statusData = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    return statusData;
  } catch (error) {
    logger.error('Error reading bot status:', error);
    return { ...defaultStatus };
  }
}

// Update status
export function updateBotStatus(updates) {
  try {
    ensureDirectoryExists();
    
    const currentStatus = getBotStatus();
    const newStatus = { ...currentStatus, ...updates };
    
    fs.writeFileSync(STATUS_FILE, JSON.stringify(newStatus));
    return newStatus;
  } catch (error) {
    logger.error('Error updating bot status:', error);
    return null;
  }
}

// Mark bot as online
export function markBotOnline(serverCount = 0) {
  return updateBotStatus({
    status: 'online',
    lastActive: new Date().toISOString(),
    servers: serverCount,
    lastRestart: new Date().toISOString()
  });
}

// Mark bot as offline
export function markBotOffline() {
  return updateBotStatus({
    status: 'offline',
    lastActive: new Date().toISOString()
  });
}

// Check if bot is disabled
export function isBotDisabled() {
  const status = getBotStatus();
  return status.isDisabled;
}

// Disable the bot
export function disableBot() {
  return updateBotStatus({
    isDisabled: true
  });
}

// Enable the bot
export function enableBot() {
  return updateBotStatus({
    isDisabled: false
  });
}

// Increment command counter
export function incrementCommandCounter() {
  const status = getBotStatus();
  return updateBotStatus({
    commands: status.commands + 1,
    lastActive: new Date().toISOString()
  });
} 