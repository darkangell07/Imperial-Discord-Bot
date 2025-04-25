import { createEmbed, COLORS } from '../../utils/embeds.js';
import { getUser, updateUser } from '../../database/database.js';

// Define shop items
const shopItems = [
  {
    itemId: 'fishing_rod',
    name: 'Fishing Rod',
    description: 'Use this to catch fish and earn coins',
    price: 250,
    emoji: '🎣',
    usable: true
  },
  {
    itemId: 'pickaxe',
    name: 'Pickaxe',
    description: 'Mine resources and earn coins',
    price: 300,
    emoji: '⛏️',
    usable: true
  },
  {
    itemId: 'sword',
    name: 'Sword',
    description: 'Hunt monsters and earn coins',
    price: 500,
    emoji: '⚔️',
    usable: true
  },
  {
    itemId: 'crown',
    name: 'Imperial Crown',
    description: 'Show off your wealth',
    price: 5000,
    emoji: '👑',
    usable: false
  },
  {
    itemId: 'bank_upgrade',
    name: 'Bank Upgrade',
    description: 'Increase your bank capacity',
    price: 1000,
    emoji: '🏦',
    usable: true
  }
];

export default {
  name: 'shop',
  aliases: ['store', 'market'],
  category: 'economy',
  description: 'Browse or buy items from the shop',
  usage: '!shop [buy] [item] [quantity]',
  cooldown: 3,
  async execute(client, message, args) {
    // If no args or "list", show the shop
    if (!args.length || args[0] === 'list') {
      return showShop(message);
    }
    
    // If "buy", process purchase
    if (args[0] === 'buy') {
      // Check if item is specified
      if (!args[1]) {
        return message.reply('Please specify an item to buy. Use `!shop` to see available items.');
      }
      
      // Find the item
      const itemName = args.slice(1).join(' ').toLowerCase();
      const item = shopItems.find(i => i.name.toLowerCase() === itemName || i.itemId === itemName);
      
      if (!item) {
        return message.reply(`Item "${itemName}" not found. Use \`!shop\` to see available items.`);
      }
      
      // Check if quantity is specified
      const quantity = parseInt(args[2]) || 1;
      if (quantity <= 0) {
        return message.reply('Quantity must be a positive number.');
      }
      
      // Process the purchase
      return await buyItem(message, item, quantity);
    }
    
    // If unknown command
    return message.reply('Invalid shop command. Use `!shop` to browse or `!shop buy [item] [quantity]` to purchase.');
  }
};

async function showShop(message) {
  // Create embed fields for each item
  const fields = shopItems.map(item => {
    return {
      name: `${item.emoji} ${item.name} - ${item.price} Imperial Coins`,
      value: `${item.description}\nID: \`${item.itemId}\``,
      inline: false
    };
  });
  
  // Create embed
  const embed = createEmbed({
    title: 'Imperial Shop',
    description: 'Welcome to the Imperial Shop! Here you can buy items using your Imperial Coins.\nUse `!shop buy [item] [quantity]` to purchase.',
    color: COLORS.ECONOMY,
    fields,
    footer: { text: 'Imperial Shop' }
  });
  
  return message.reply({ embeds: [embed] });
}

async function buyItem(message, item, quantity = 1) {
  const totalCost = item.price * quantity;
  
  // Get user
  const user = await getUser(message.author.id, message.guild.id);
  
  // Check if user has enough coins
  if (user.balance < totalCost) {
    return message.reply(`You don't have enough Imperial Coins. You need ${totalCost} coins, but you only have ${user.balance}.`);
  }
  
  // Add item to inventory
  const existingItem = user.inventory.find(i => i.itemId === item.itemId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    user.inventory.push({
      itemId: item.itemId,
      name: item.name,
      description: item.description,
      quantity,
      usable: item.usable || false
    });
  }
  
  // Deduct coins from balance
  user.balance -= totalCost;
  await updateUser(message.author.id, message.guild.id, user);
  
  // Send success message
  const embed = createEmbed({
    title: 'Purchase Successful',
    description: `You have purchased ${quantity}x ${item.emoji} ${item.name}!`,
    color: COLORS.SUCCESS,
    thumbnail: message.author.displayAvatarURL({ dynamic: true }),
    fields: [
      { name: 'Item', value: item.name, inline: true },
      { name: 'Cost', value: `${totalCost} Imperial Coins`, inline: true },
      { name: 'Remaining Balance', value: `${user.balance} Imperial Coins`, inline: true }
    ],
    footer: { text: 'Imperial Shop' }
  });
  
  return message.reply({ embeds: [embed] });
}