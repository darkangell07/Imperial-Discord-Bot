# Discord Bot

A Discord bot built with discord.js that includes various commands for administration, economy, fun, games, and moderation.

## Running Locally

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your Discord bot token:
   ```
   DISCORD_TOKEN=your_discord_token_here
   ```
4. Run the bot:
   ```
   npm start
   ```

## Deploying to Render.com (Free Tier)

### Prerequisites
- A [Render.com](https://render.com) account
- A Discord bot application with token

### Step 1: Set Up Your Render.com Account
1. Sign up for Render.com if you haven't already
2. Go to your Dashboard and click "New +"

### Step 2: Configure Web Service
1. Select "Web Service"
2. Connect your repository (GitHub, GitLab, etc.)
3. Use the following settings:
   - **Name**: Your bot name
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Step 3: Add Environment Variables
1. In the Render Dashboard, navigate to your service
2. Go to "Environment" tab
3. Add the following environment variable:
   - Key: `DISCORD_TOKEN`
   - Value: Your Discord bot token

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete

### Important Notes About Render Free Tier
- Free web services spin down after 15 minutes of inactivity
- Services spin back up when receiving traffic (this may take up to a minute)
- Each free service gets 750 hours of runtime per month
- For a Discord bot, consider using a service like UptimeRobot to ping your bot every 14 minutes to prevent it from spinning down

## Commands

The bot includes commands for:
- Administration
- Economy
- Fun
- Games
- General
- Moderation

## Features
- Command handling system
- Event handling system
- Logging
- Role management
- And more!

## License
MIT