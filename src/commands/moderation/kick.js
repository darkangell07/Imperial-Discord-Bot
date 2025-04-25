import { PermissionFlagsBits } from 'discord.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';
import { logger } from '../../utils/logger.js';
import { getGuildSettings } from '../../database/database.js';

export default {
  name: 'kick',
  category: 'moderation',
  description: 'Kick a user from the server',
  usage: '!kick <user> [reason]',
  permissions: [PermissionFlagsBits.KickMembers],
  cooldown: 3,
  async execute(client, message, args) {
    try {
      if (!args.length) {
        return message.reply('You need to specify a user to kick!');
      }
      
      // Get target user
      const target = message.mentions.members.first() || 
                    await message.guild.members.fetch(args[0]).catch(() => null);
      
      if (!target) {
        return message.reply('Could not find that user.');
      }
      
      // Check if the user is kickable
      if (!target.kickable) {
        return message.reply('I cannot kick this user. They may have a higher role than me, or I don\'t have kick permissions.');
      }
      
      // Get kick reason
      const reason = args.slice(1).join(' ') || 'No reason provided';
      
      // Kick the user
      await target.kick(`${message.author.tag}: ${reason}`);
      
      // Create success embed
      const embed = createEmbed({
        title: 'User Kicked',
        description: `**${target.user.tag}** has been kicked from the server.`,
        color: COLORS.MODERATION,
        thumbnail: target.user.displayAvatarURL({ dynamic: true }),
        fields: [
          { name: 'Reason', value: reason, inline: false },
          { name: 'Moderator', value: message.author.tag, inline: false }
        ],
        footer: { text: `User ID: ${target.id}` }
      });
      
      // Log the kick if moderation logs are enabled
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
      logger.error('Error in kick command:', error);
      return message.reply('There was an error trying to kick that user. Please check my permissions and try again.');
    }
  }
};