import { getUser } from '../../database/database.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';

export default {
  name: 'inventory',
  aliases: ['inv', 'items'],
  category: 'economy',
  description: 'View your inventory of items',
  usage: '!inventory',
  cooldown: 5,
  async execute(client, message, args) {
    try {
      // Get user
      const user = await getUser(message.author.id, message.guild.id);
      
      // Check if inventory is empty
      if (!user.inventory || user.inventory.length === 0) {
        const emptyEmbed = createEmbed({
          title: 'Imperial Inventory',
          description: 'Your inventory is empty. Buy items from the shop with `!shop`!',
          color: COLORS.ECONOMY,
          thumbnail: message.author.displayAvatarURL({ dynamic: true }),
          footer: { text: 'Imperial Shop' }
        });
        
        return message.reply({ embeds: [emptyEmbed] });
      }
      
      // Create inventory fields (10 items per page)
      const itemsPerPage = 10;
      const items = user.inventory;
      
      // Get page number
      const page = parseInt(args[0]) || 1;
      const maxPages = Math.ceil(items.length / itemsPerPage);
      
      // Validate page number
      if (page < 1 || page > maxPages) {
        return message.reply(`Invalid page number. Please specify a page between 1 and ${maxPages}.`);
      }
      
      // Get items for current page
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentItems = items.slice(startIndex, endIndex);
      
      // Create embed fields
      const fields = currentItems.map(item => ({
        name: `${item.name} (x${item.quantity})`,
        value: item.description || 'No description',
        inline: false
      }));
      
      // Create embed
      const embed = createEmbed({
        title: 'Imperial Inventory',
        description: `${message.author.username}'s items (Page ${page}/${maxPages})`,
        color: COLORS.ECONOMY,
        fields,
        thumbnail: message.author.displayAvatarURL({ dynamic: true }),
        footer: { text: `Use !inventory [page] to view other pages | Total items: ${items.length}` }
      });
      
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in inventory command:', error);
      return message.reply('There was an error accessing your inventory. Please try again later.');
    }
  }
};