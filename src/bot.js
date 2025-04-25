import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';
import http from 'http';

// Configure environment variables
config();

// Create client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildIntegrations
  ]
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();
client.config = {
  prefix: '!',
  botName: 'Imperial Bot',
  defaultCooldown: 3
};

// Dynamically import commands
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const eventModule = await import(`file://${filePath}`);
  const event = eventModule.default;
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(client, ...args));
  } else {
    client.on(event.name, (...args) => event.execute(client, ...args));
  }
}

// Load commands
const commandFoldersPath = path.join(__dirname, 'commands');
const commandItems = fs.readdirSync(commandFoldersPath);

logger.info('Starting to load commands...');

// First load commands from category folders
for (const item of commandItems) {
  const itemPath = path.join(commandFoldersPath, item);
  
  // Check if the item is a directory
  if (fs.statSync(itemPath).isDirectory()) {
    const commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(itemPath, file);
      const commandModule = await import(`file://${filePath}`);
      const command = commandModule.default;
      
      if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
        logger.info(`Loaded command from directory: ${command.name} (Category: ${command.category || 'none'})`);
      } else {
        logger.warn(`The command at ${filePath} is missing a required "name" or "execute" property.`);
      }
    }
  }
  // If it's a .js file in the root commands directory, load it directly
  else if (item.endsWith('.js')) {
    const filePath = path.join(commandFoldersPath, item);
    const commandModule = await import(`file://${filePath}`);
    const command = commandModule.default;
    
    if ('name' in command && 'execute' in command) {
      client.commands.set(command.name, command);
      logger.info(`Loaded root command: ${command.name} (Category: ${command.category || 'none'})`);
    } else {
      logger.warn(`The command at ${filePath} is missing a required "name" or "execute" property.`);
    }
  }
}

// Log command count by category
const categories = {};
client.commands.forEach(cmd => {
  const category = cmd.category || 'uncategorized';
  if (!categories[category]) categories[category] = 0;
  categories[category]++;
});

logger.info('Command count by category:');
Object.entries(categories).forEach(([category, count]) => {
  logger.info(`- ${category}: ${count} commands`);
});

// Initialize the client if not already initialized
let isReady = false;

const initializeBot = async () => {
  if (!isReady) {
    try {
      // Log in to Discord
      await client.login(process.env.DISCORD_TOKEN);
      isReady = true;
      logger.info('Bot successfully logged in');
    } catch (error) {
      logger.error('Failed to login to Discord:', error);
      isReady = false;
    }
  }
  return isReady;
};

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
  logger.error('Unhandled promise rejection:', error);
});

// Initialize bot
initializeBot();

// Create a simple HTTP server for Render.com to keep the bot alive
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'Bot is running!', timestamp: new Date().toISOString() }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`HTTP server running on port ${PORT}`);
});