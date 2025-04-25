import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { getGuildSettings } from '../../database/database.js';

export default {
  name: 'ban',
  category: 'moderation',
  description: 'Ban a user from the server',
  usage: '!ban <user> [reason]',
  permissions: [PermissionFlagsBits.BanMembers],
  cooldown: 3,
  async execute(client, message, args) {
    try {
      if (!args.length) {
        return message.reply('You need to specify a user to ban!');
      }
      
      // Get target user
      const target = message.mentions.members.first() || 
                    await message.guild.members.fetch(args[0]).catch(() => null);
      
      if (!target) {
        return message.reply('Could not find that user.');
      }
      
      // Check if the user is bannable
      if (!target.bannable) {
        return message.reply('I cannot ban this user. They may have a higher role than me, or I don\'t have ban permissions.');
      }
      
      // Get ban reason
      const reason = args.slice(1).join(' ') || 'No reason provided';
      
      // Ban the user
      await target.ban({ reason: `${message.author.tag}: ${reason}` });
      
      // Create success embed
      const embed = createEmbed({
        title: 'User Banned',
        description: `**${target.user.tag}** has been banned from the server.`,
        color: COLORS.MODERATION,
        thumbnail: target.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: 'Reason', value: reason, inline: false },
          { name: 'Moderator', value: message.author.tag, inline: false }
        ],
        footer: { text: `User ID: ${target.id}` }
      });
      
      // Log the ban if moderation logs are enabled
      const guildSettings = await getGuildSettings(message.guild.id);
      if (guildSettings.moderationLogs) {
        const logChannel = message.guild.channels.cache.get(guildSettings.moderationLogs);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }
      
      // Send confirmation to the command channel
      return message.reply({ embeds: [embed] });
    } catch (error) {
      logger.error('Error in ban command:', error);
      return message.reply('There was an error trying to ban that user. Please check my permissions and try again.');
    }
  }
};