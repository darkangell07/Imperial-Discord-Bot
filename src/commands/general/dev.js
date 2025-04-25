import { createEmbed, COLORS } from '../../utils/embeds.js';

export default {
  name: 'dev',
  description: 'Found a bug report it',
  aliases: ['developer', 'contact', 'bug', 'report'],
  category: 'general',
  usage: '!dev',
  cooldown: 5,
  async execute(client, message, args) {
    const embed = createEmbed({
      title: '👨‍💻 Developer Information',
      description: '**Bot developed by DarkAngel**\n\nFound a bug or issue? Contact the developer directly:',
      color: COLORS.INFO,
      fields: [
        { 
          name: 'Discord',
          value: 'DM <@918152747377905675>',
          inline: true
        },
        { 
          name: 'Email',
          value: 'darka9962@gmail.com',
          inline: true
        },
        {
          name: 'How to Report Issues',
          value: 'When reporting a bug, please include:\n• Command used\n• What happened\n• What should have happened\n• Any error messages received',
          inline: false
        }
      ],
      footer: { text: 'Imperial Bot • Developed by DarkAngel' }
    });
    
    return message.reply({ embeds: [embed] });
  }
}; 