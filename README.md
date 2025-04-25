# Imperial Discord Bot with Dashboard

A versatile Discord bot with a web dashboard for monitoring and control.

## Features

- 🤖 **Discord Bot**: A powerful Discord bot with various commands
- 📊 **Web Dashboard**: Monitor bot status and control operations
- 🚀 **Vercel Deployment**: Easy deployment to Vercel's serverless platform

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your configuration:
   ```
   DISCORD_TOKEN=your_token_here
   DISCORD_APP_ID=your_app_id_here
   DISCORD_PUBLIC_KEY=your_public_key_here
   ```
4. Run the development server: `npm run dev`

## Dashboard

The dashboard provides:
- Real-time bot status monitoring
- Control buttons to restart or shutdown the bot
- Stats about the bot's performance

## Deploying to Vercel

1. Create a Vercel account if you don't have one
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel login` and follow the prompts
4. Run `npm run build` to build the project
5. Run `vercel` to deploy to Vercel
6. Add your environment variables in the Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from your `.env` file

## Important Note for Serverless Deployments

In a serverless environment like Vercel:
- The bot runs as a serverless function, responding to interactions
- The restart/shutdown buttons in the dashboard simulate these actions
- For true restart/shutdown capabilities, you would need to use Vercel's API to redeploy or integrate with a database

## Bot Commands

Use `!help` to see all available commands.

## License

This project is open source.