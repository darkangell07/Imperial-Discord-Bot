import { createEmbed, COLORS } from '../../utils/embeds.js';
import axios from 'axios';

export default {
  name: 'meme',
  category: 'fun',
  description: 'Get a random meme from Reddit',
  usage: '!meme',
  cooldown: 5,
  async execute(client, message, args) {
    try {
      // Fetch meme from Reddit API
      const response = await axios.get('https://www.reddit.com/r/memes/random/.json');
      const post = response.data[0].data.children[0].data;
      
      // Get post details
      const title = post.title;
      const url = post.url;
      const upvotes = post.ups;
      const author = post.author;
      const postLink = `https://reddit.com${post.permalink}`;
      
      // Create embed
      const embed = createEmbed({
        title,
        color: COLORS.FUN,
        url: postLink,
        image: url,
        footer: { text: `👍 ${upvotes} | Posted by u/${author}` }
      });
      
      return message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in meme command:', error);
      return message.reply('There was an error fetching a meme. Please try again later.');
    }
  }
};