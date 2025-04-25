import { logger } from '../utils/logger.js';
import { Events } from 'discord.js';
import { showAllCategories, showCategoryCommands } from '../commands/help.js';

export default {
  name: Events.InteractionCreate,
  once: false,
  async execute(client, interaction) {
    try {
      // Only handle button interactions
      if (!interaction.isButton()) return;
      
      // Handle help menu buttons
      if (interaction.customId.startsWith('help_')) {
        await interaction.deferUpdate();
        
        const category = interaction.customId.split('_')[1];
        
        // Back button to show all categories
        if (category === 'back') {
          await showAllCategories(client, interaction);
          return;
        }
        
        // Show commands for selected category
        if (['economy', 'games', 'fun', 'general'].includes(category)) {
          await showCategoryCommands(client, interaction, category);
          return;
        }
      }
    } catch (error) {
      logger.error('Error handling interaction:', error);
      
      // If interaction has not been replied to or deferred, send an error message
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ 
          content: 'There was an error processing your interaction!', 
          ephemeral: true 
        }).catch(() => {});
      } else {
        await interaction.reply({ 
          content: 'There was an error processing your interaction!', 
          ephemeral: true 
        }).catch(() => {});
      }
    }
  }
}; 