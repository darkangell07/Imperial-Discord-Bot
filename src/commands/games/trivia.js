import { getUser, updateUser } from '../../database/database.js';
import { createEmbed, COLORS } from '../../utils/embeds.js';
import axios from 'axios';

export default {
  name: 'trivia',
  category: 'games',
  description: 'Play trivia and earn Imperial Coins',
  usage: '!trivia',
  cooldown: 30,
  async execute(client, message, args) {
    try {
      // Fetch trivia question
      const response = await axios.get('https://opentdb.com/api.php?amount=1&difficulty=medium&type=multiple&encode=url3986');
      const questionData = response.data.results[0];
      
      if (!questionData) {
        return message.reply('Failed to fetch a trivia question. Please try again later.');
      }
      
      // Decode question and answers
      const question = decodeURIComponent(questionData.question);
      const correctAnswer = decodeURIComponent(questionData.correct_answer);
      const incorrectAnswers = questionData.incorrect_answers.map(a => decodeURIComponent(a));
      
      // Combine all answers and shuffle them
      const allAnswers = [correctAnswer, ...incorrectAnswers];
      shuffleArray(allAnswers);
      
      // Create options display (A, B, C, D)
      const options = ['🇦', '🇧', '🇨', '🇩'];
      const answerMap = {};
      const optionsText = allAnswers.map((answer, index) => {
        const option = options[index];
        answerMap[option] = answer;
        return `${option} ${answer}`;
      }).join('\n');
      
      // Create embed for the question
      const embed = createEmbed({
        title: `Trivia - ${decodeURIComponent(questionData.category)}`,
        description: `**Question:** ${question}\n\n${optionsText}\n\nReact with the correct answer within 20 seconds!`,
        color: COLORS.GAMES,
        footer: { text: `Difficulty: ${decodeURIComponent(questionData.difficulty)} | Reward: 100 Imperial Coins` }
      });
      
      // Send the message and add reactions
      const triviaMessage = await message.channel.send({ embeds: [embed] });
      
      // Add reactions
      for (const option of options.slice(0, allAnswers.length)) {
        await triviaMessage.react(option);
      }
      
      // Create filter for reactions
      const filter = (reaction, user) => {
        return options.includes(reaction.emoji.name) && user.id === message.author.id;
      };
      
      // Wait for reaction
      try {
        const collected = await triviaMessage.awaitReactions({ filter, max: 1, time: 20000, errors: ['time'] });
        const reaction = collected.first();
        const selectedAnswer = answerMap[reaction.emoji.name];
        
        // Check if the answer is correct
        const isCorrect = selectedAnswer === correctAnswer;
        
        // Get user
        const user = await getUser(message.author.id, message.guild.id);
        
        // Update user balance if correct
        if (isCorrect) {
          user.balance += 100;
          await updateUser(user);
        }
        
        // Create result embed
        const resultEmbed = createEmbed({
          title: isCorrect ? 'Correct Answer!' : 'Incorrect Answer!',
          description: isCorrect ? 
            `That's right! The answer is: **${correctAnswer}**\nYou earned 100 Imperial Coins!` : 
            `Sorry, that's wrong. The correct answer is: **${correctAnswer}**`,
          color: isCorrect ? COLORS.SUCCESS : COLORS.ERROR,
          fields: isCorrect ? [
            { name: 'Current Balance', value: `${user.balance} Imperial Coins`, inline: true }
          ] : [],
          footer: { text: 'Imperial Trivia' }
        });
        
        return message.channel.send({ embeds: [resultEmbed] });
      } catch (e) {
        // Time ran out
        const timeoutEmbed = createEmbed({
          title: 'Time\'s Up!',
          description: `You didn't answer in time. The correct answer was: **${correctAnswer}**`,
          color: COLORS.WARNING,
          footer: { text: 'Imperial Trivia' }
        });
        
        return message.channel.send({ embeds: [timeoutEmbed] });
      }
    } catch (error) {
      console.error('Error in trivia command:', error);
      return message.reply('There was an error starting the trivia game. Please try again later.');
    }
  }
};

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}