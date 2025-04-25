import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';
import { isBotDisabled, markBotOnline, incrementCommandCounter } from './utils/bot-status.js';

// Configure environment variables
config();

// Create a new client instance
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
  
  if (event.name === 'interactionCreate') {
    // Modify the interaction create handler to check if bot is disabled
    client.on(event.name, async (...args) => {
      const interaction = args[0];
      
      // Check if bot is disabled before processing the command
      if (isBotDisabled() && interaction.isCommand()) {
        return interaction.reply({
          content: "⚠️ The bot is currently disabled. Please try again later.",
          ephemeral: true
        });
      }
      
      // Process the interaction and increment command counter if it's a command
      if (interaction.isCommand()) {
        incrementCommandCounter();
      }
      
      await event.execute(client, ...args);
    });
  } else if (event.once) {
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

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    logger.info('Successfully logged in to Discord');
    // Mark the bot as online and record server count
    markBotOnline(client.guilds.cache.size);
  })
  .catch(error => {
    logger.error('Failed to login to Discord:', error);
    process.exit(1);
  });

process.on('unhandledRejection', error => {
  logger.error('Unhandled promise rejection:', error);
});