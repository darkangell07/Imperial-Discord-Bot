import { createEmbed, helpEmbed, COLORS } from '../utils/embeds.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  name: 'help',
  description: 'Display help information for commands',
  aliases: ['commands'],
  category: 'general',
  usage: '!help [command/category]',
  cooldown: 5,
  async execute(client, message, args) {
    const { commands } = client;
    
    // If no args, show all command categories
    if (!args.length) {
      return showAllCategories(client, message);
    }
    
    const commandName = args[0].toLowerCase();
    
    // Check if argument is a category
    if (['economy', 'games', 'fun', 'general'].includes(commandName)) {
      return showCategoryCommands(client, message, commandName);
    }
    
    // Otherwise, find the specific command
    const command = commands.get(commandName) ||
                   commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command || command.hidden) {
      return message.reply({
        embeds: [createEmbed({
          title: '❌ Command Not Found',
          description: `Could not find command or category: \`${commandName}\`\n📚 Use \`!help\` to see all available categories.`,
          color: COLORS.ERROR
        })]
      });
    }
    
    // Show detailed command help
    return showCommandHelp(message, command);
  }
};

/**
 * Shows all command categories
 * @param {Object} client - Discord client
 * @param {Object} context - Message or Interaction object
 */
export async function showAllCategories(client, context) {
  const categories = [
    {
      name: '💰 Economy Commands',
      value: '💸 Manage your Imperial Coins, shop, and inventory.\n🔍 `!help economy`',
      inline: false
    },
    {
      name: '🎮 Games Commands',
      value: '🎲 Play games to earn Imperial Coins.\n🔍 `!help games`',
      inline: false
    },
    {
      name: '🎭 Fun Commands',
      value: '😄 Fun and entertaining commands.\n🔍 `!help fun`',
      inline: false
    },
    {
      name: '🛠️ General Commands',
      value: '📋 Utility and information commands.\n🔍 `!help general`',
      inline: false
    }
  ];
  
  const embed = helpEmbed({
    title: '📚 Imperial Bot Help Menu',
    description: `✨ Welcome to the Imperial Bot help menu! Use \`${client.config.prefix}help [category/command]\` to get more detailed help.`,
    commands: categories,
    client: client,
    footer: { text: `💡 Type ${client.config.prefix}help [category] to see commands in that category` }
  });
  
  // Create buttons for each category
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('help_economy')
        .setLabel('Economy')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('💰'),
      new ButtonBuilder()
        .setCustomId('help_games')
        .setLabel('Games')
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎮'),
      new ButtonBuilder()
        .setCustomId('help_fun')
        .setLabel('Fun')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🎭'),
      new ButtonBuilder()
        .setCustomId('help_general')
        .setLabel('General')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🛠️')
    );
  
  // Handle both message and interaction responses
  if (context.reply && !context.deferred && !context.replied) {
    return context.reply({ embeds: [embed], components: [row] });
  } else {
    return context.editReply({ embeds: [embed], components: [row] });
  }
}

/**
 * Shows commands for a specific category
 * @param {Object} client - Discord client
 * @param {Object} context - Message or Interaction object
 * @param {string} category - Command category
 */
export async function showCategoryCommands(client, context, category) {
  // Get all commands in the category (exclude hidden commands)
  const categoryCommands = client.commands.filter(cmd => 
    cmd.category === category && !cmd.hidden
  );
  
  if (!categoryCommands.size) {
    const errorEmbed = createEmbed({
      title: '⚠️ Category Empty',
      description: `❌ No commands found in category: \`${category}\``,
      color: COLORS.WARNING
    });
    
    // Handle both message and interaction responses
    if (context.reply && !context.deferred && !context.replied) {
      return context.reply({ embeds: [errorEmbed] });
    } else {
      return context.editReply({ embeds: [errorEmbed], components: [] });
    }
  }
  
  // Get emoji for each command
  const categoryEmojis = {
    economy: { default: '💰' },
    games: { default: '🎮' },
    fun: { default: '🎭' },
    general: { default: '🛠️' },
    moderation: { default: '🛡️' },
    admin: { default: '⚙️' }
  };
  
  // Command-specific emojis
  const commandEmojis = {
    balance: '💵',
    daily: '📅',
    shop: '🛒',
    inventory: '🎒',
    profile: '👤',
    info: 'ℹ️',
    help: '📚',
    ping: '🏓',
    roll: '🎲',
    coinflip: '🪙',
    slots: '🎰',
    meme: '😂',
    joke: '🃏',
    quote: '💬',
    '8ball': '🎱'
  };
  
  // Create fields for each command
  const fields = categoryCommands.map(cmd => {
    // Determine emoji
    const emoji = commandEmojis[cmd.name] || categoryEmojis[category]?.default || '📌';
    
    return {
      name: `${emoji} ${client.config.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases.join(', ')})` : ''}`,
      value: `${cmd.description}\n📝 Usage: \`${cmd.usage || `${client.config.prefix}${cmd.name}`}\``,
      inline: false
    };
  });
  
  // Category titles and colors
  const titles = {
    economy: '💰 Economy Commands',
    games: '🎮 Games Commands',
    fun: '🎭 Fun Commands',
    general: '🛠️ General Commands',
    moderation: '🛡️ Moderation Commands',
    admin: '⚙️ Admin Commands'
  };
  
  const colors = {
    economy: COLORS.ECONOMY,
    games: COLORS.GAMES,
    fun: COLORS.PRIMARY,
    general: COLORS.INFO,
    moderation: COLORS.MODERATION,
    admin: COLORS.ADMIN
  };
  
  // Create embed
  const embed = createEmbed({
    title: titles[category] || `${category.charAt(0).toUpperCase() + category.slice(1)} Commands`,
    description: `✨ Here are all commands in the ${category} category:`,
    color: colors[category] || COLORS.PRIMARY,
    fields: fields,
    footer: { text: `💡 Use ${client.config.prefix}help [command] for more details on a specific command` }
  });
  
  // Create back button
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('help_back')
        .setLabel('Back to Categories')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('↩️')
    );
  
  // Handle both message and interaction responses
  if (context.reply && !context.deferred && !context.replied) {
    return context.reply({ embeds: [embed], components: [row] });
  } else {
    return context.editReply({ embeds: [embed], components: [row] });
  }
}

/**
 * Shows detailed help for a specific command
 * @param {Object} context - Message or Interaction object
 * @param {Object} command - Command object
 */
export async function showCommandHelp(context, command) {
  // Don't show help for hidden commands
  if (command.hidden) {
    return context.reply({
      embeds: [createEmbed({
        title: '❌ Command Not Found',
        description: '⚠️ This command does not exist or is hidden.',
        color: COLORS.ERROR
      })]
    });
  }
  
  // Command-specific emojis
  const commandEmojis = {
    balance: '💵',
    daily: '📅',
    shop: '🛒',
    inventory: '🎒',
    profile: '👤',
    info: 'ℹ️',
    help: '📚',
    ping: '🏓',
    roll: '🎲',
    coinflip: '🪙',
    slots: '🎰',
    meme: '😂',
    joke: '🃏',
    quote: '💬',
    '8ball': '🎱'
  };
  
  // Get emoji for the command
  const emoji = commandEmojis[command.name] || '📌';
  
  // Determine command color based on category
  let color = COLORS.INFO;
  if (command.category) {
    switch (command.category) {
      case 'economy': color = COLORS.ECONOMY; break;
      case 'games': color = COLORS.GAMES; break;
      case 'fun': color = COLORS.PRIMARY; break;
      case 'moderation': color = COLORS.MODERATION; break;
      case 'admin': color = COLORS.ADMIN; break;
    }
  }
  
  // Create fields for the command info
  const fields = [
    { name: '📝 Usage', value: `\`${command.usage || `!${command.name}`}\``, inline: false }
  ];
  
  // Add aliases if any
  if (command.aliases && command.aliases.length) {
    fields.push({ name: '🔄 Aliases', value: command.aliases.join(', '), inline: true });
  }
  
  // Add cooldown if any
  if (command.cooldown) {
    fields.push({ name: '⏱️ Cooldown', value: `${command.cooldown} seconds`, inline: true });
  }
  
  // Add category if any
  if (command.category) {
    const categoryEmojis = {
      economy: '💰',
      games: '🎮',
      fun: '🎭',
      general: '🛠️',
      moderation: '🛡️',
      admin: '⚙️'
    };
    
    fields.push({ 
      name: '📂 Category', 
      value: `${categoryEmojis[command.category] || ''} ${command.category}`, 
      inline: true 
    });
  }
  
  // Add permissions if any
  if (command.permissions && command.permissions.length) {
    const formattedPerms = command.permissions.map(perm => {
      return perm.toString().split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
    }).join(', ');
    
    fields.push({ name: '🔒 Required Permissions', value: formattedPerms, inline: false });
  }
  
  // Create embed
  const embed = createEmbed({
    title: `${emoji} Command: ${command.name}`,
    description: command.description,
    color: color,
    fields: fields,
    footer: { text: '💡 Imperial Bot Help' }
  });
  
  // Create back button for the category
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`help_${command.category || 'back'}`)
        .setLabel(`Back to ${command.category ? command.category.charAt(0).toUpperCase() + command.category.slice(1) : 'Categories'}`)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('↩️')
    );
  
  // Handle both message and interaction responses
  if (context.reply && !context.deferred && !context.replied) {
    return context.reply({ embeds: [embed], components: [row] });
  } else {
    return context.editReply({ embeds: [embed], components: [row] });
  }
}