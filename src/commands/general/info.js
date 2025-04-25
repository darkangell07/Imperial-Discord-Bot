import { createEmbed, COLORS } from '../../utils/embeds.js';
import { getGuildSettings } from '../../database/database.js';

export default {
  name: 'info',
  description: 'Display information about the current server',
  aliases: ['serverinfo', 'server'],
  category: 'general',
  usage: '!info',
  cooldown: 10,
  async execute(client, message, args) {
    const guild = message.guild;
    
    // Get guild settings for prefix
    const guildSettings = await getGuildSettings(guild.id);
    const prefix = guildSettings.prefix || client.config.prefix;
    
    // Get member stats
    const totalMembers = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(member => 
      member.presence?.status === 'online' || 
      member.presence?.status === 'idle' || 
      member.presence?.status === 'dnd'
    ).size;
    const botCount = guild.members.cache.filter(member => member.user.bot).size;
    
    // Get channel stats
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const categoryChannels = guild.channels.cache.filter(c => c.type === 4).size;
    
    // Get role count
    const roleCount = guild.roles.cache.size - 1; // Subtract @everyone role
    
    // Format creation date
    const createdAt = new Date(guild.createdTimestamp);
    const createdDate = createdAt.toLocaleDateString();
    const createdTime = createdAt.toLocaleTimeString();
    const daysAgo = Math.floor((Date.now() - guild.createdTimestamp) / (1000 * 60 * 60 * 24));
    
    const embed = createEmbed({
      title: `${guild.name} Server Information`,
      description: `Information about this Discord server`,
      color: COLORS.INFO,
      thumbnail: guild.iconURL({ dynamic: true }),
      fields: [
        { name: '📊 Server Stats', value: 
          `• Members: **${totalMembers}** (${onlineMembers} online)\n` +
          `• Bots: **${botCount}**\n` +
          `• Roles: **${roleCount}**\n` +
          `• Server ID: **${guild.id}**`,
          inline: true
        },
        { name: '📜 Channels', value: 
          `• Text: **${textChannels}**\n` +
          `• Voice: **${voiceChannels}**\n` +
          `• Categories: **${categoryChannels}**\n` +
          `• Total: **${textChannels + voiceChannels + categoryChannels}**`,
          inline: true
        },
        { name: '⚙️ Configuration', value: 
          `• Prefix: **${prefix}**\n` +
          `• Welcome Channel: ${guildSettings.welcomeChannel ? `<#${guildSettings.welcomeChannel}>` : '**Not set**'}\n` +
          `• Moderation Logs: ${guildSettings.moderationLogs ? `<#${guildSettings.moderationLogs}>` : '**Not set**'}\n` +
          `• Automod: **${guildSettings.automod?.enabled ? 'Enabled' : 'Disabled'}**`,
          inline: false
        },
        { name: '📅 Server Created', value: 
          `**${createdDate}** at **${createdTime}**\n` +
          `(${daysAgo} days ago)`,
          inline: false
        }
      ],
      footer: { text: `Requested by ${message.author.tag}` }
    });
    
    return message.reply({ embeds: [embed] });
  }
}; 