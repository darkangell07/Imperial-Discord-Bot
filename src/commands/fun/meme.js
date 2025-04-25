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
      // Try multiple subreddits in case one fails
      const subreddits = ['memes', 'dankmemes', 'funny'];
      let success = false;
      let response;
      let errorMessage = '';
      
      // Try each subreddit until one works
      for (const subreddit of subreddits) {
        try {
          response = await axios.get(`https://www.reddit.com/r/${subreddit}/hot.json?limit=100`);
          success = true;
          break;
        } catch (err) {
          errorMessage = err.message;
          continue;
        }
      }
      
      if (!success) {
        throw new Error(`Failed to fetch from any subreddit: ${errorMessage}`);
      }
      
      // Filter out stickied and non-image posts
      const posts = response.data.data.children.filter(post => 
        !post.data.stickied && 
        (post.data.url.endsWith('.jpg') || 
         post.data.url.endsWith('.png') || 
         post.data.url.endsWith('.gif'))
      );
      
      if (posts.length === 0) {
        return message.reply('No suitable memes found. Please try again later.');
      }
      
      // Get a random post from the filtered list
      const randomPost = posts[Math.floor(Math.random() * posts.length)].data;
      
      // Get post details
      const title = randomPost.title;
      const url = randomPost.url;
      const upvotes = randomPost.ups;
      const author = randomPost.author;
      const postLink = `https://reddit.com${randomPost.permalink}`;
      
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