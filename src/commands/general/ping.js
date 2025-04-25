import { createEmbed, COLORS } from '../../utils/embeds.js';

export default {
  name: 'ping',
  description: 'Check the bot\'s response time',
  aliases: ['latency'],
  category: 'general',
  usage: '!ping',
  cooldown: 3,
  async execute(client, message, args) {
    const sent = await message.reply({ 
      embeds: [createEmbed({
        title: 'Pinging...',
        color: COLORS.INFO
      })]
    });
    
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    
    sent.edit({
      embeds: [createEmbed({
        title: '🏓 Pong!',
        description: `Bot Latency: **${latency}ms**\nAPI Latency: **${apiLatency}ms**`,
        color: COLORS.INFO,
        footer: { text: 'Imperial Bot' }
      })]
    });
  }
}; 