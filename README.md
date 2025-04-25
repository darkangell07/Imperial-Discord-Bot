# Imperial Discord Bot

A versatile Discord bot with moderation, economy, and fun commands!

## Features

- 🛠️ **Moderation Commands**: Keep your server safe with ban, kick, mute, etc.
- 💰 **Economy System**: Earn coins, shop, and manage your inventory
- 🎮 **Games**: Play fun games to earn coins and have fun
- 🤖 **Utility**: Helpful utility commands for server management

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your Discord bot token:
   ```
   DISCORD_TOKEN=your_token_here
   ```
4. Start the bot: `npm start`

## Deployment on Render.com (24/7)

This bot is configured to be deployed on Render.com for 24/7 uptime:

1. Create a free account on [Render.com](https://render.com)
2. Fork this repository to your GitHub account
3. On Render dashboard, click "New" and select "Web Service"
4. Connect your GitHub account and select this repository
5. Configure your service:
   - Name: `imperial-discord-bot` (or your preferred name)
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add the environment variable:
   - Key: `DISCORD_TOKEN`
   - Value: Your Discord bot token
7. Select the free plan and click "Create Web Service"

### Benefits of Render.com for 24/7 Hosting

- **Free Tier 24/7 Uptime**: Unlike Vercel's free tier, Render's free plan offers continuous runtime without sleep
- **Automatic Deployments**: Automatically deploys when you push changes to your repository
- **Easy Environment Management**: Simple interface for managing environment variables
- **Monitoring & Logs**: Real-time logs and monitoring through the Render dashboard

## Command Categories

- **Economy**: `balance`, `daily`, `work`, `shop`, `inventory`, `transfer`
- **Fun**: Various fun and interactive commands
- **Moderation**: Commands to manage users and keep your server safe
- **Admin**: Server configuration and settings

## Built With

- [Discord.js](https://discord.js.org/) - Discord API wrapper
- [Quick.db](https://quickdb.js.org/) - Local database storage

## Commands

Use `!help` to see all available commands.
Use `!help [command]` to get detailed information about a specific command.

## License

This project is licensed under the MIT License.