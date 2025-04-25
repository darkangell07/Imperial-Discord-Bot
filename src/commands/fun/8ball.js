import { createEmbed, COLORS } from '../../utils/embeds.js';

// 8ball responses
const responses = [
  'It is certain.',
  'It is decidedly so.',
  'Without a doubt.',
  'Yes, definitely.',
  'You may rely on it.',
  'As I see it, yes.',
  'Most likely.',
  'Outlook good.',
  'Yes.',
  'Signs point to yes.',
  'Reply hazy, try again.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  'Don\'t count on it.',
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Very doubtful.'
];

export default {
  name: '8ball',
  aliases: ['eightball', 'magic8'],
  category: 'fun',
  description: 'Ask the magic 8ball a question',
  usage: '!8ball <question>',
  cooldown: 3,
  async execute(client, message, args) {
    try {
      if (!args.length) {
        return message.reply('You need to ask a question!');
      }
      
      const question = args.join(' ');
      
      // Get random response
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      // Create embed
      const embed = createEmbed({
        title: '🎱 Magic 8-Ball',
        color: COLORS.FUN,
        fields: [
          { name: 'Question', value: question, inline: false },
          { name: 'Answer', value: response, inline: false }
        ],
        thumbnail: 'https://i.imgur.com/44uYT3K.png',
        footer: { text: 'Imperial Magic 8-Ball' }
      });
      
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in 8ball command:', error);
      return message.reply('There was an error consulting the magic 8-ball. Please try again later.');
    }
  }
};