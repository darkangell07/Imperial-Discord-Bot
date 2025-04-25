/*
 * This file contains information on how to keep your bot running 24/7 on Render.com free tier
 *
 * Render.com free tier web services go to sleep after 15 minutes of inactivity.
 * To keep your bot running, you need to "ping" it regularly.
 *
 * Steps to set up UptimeRobot:
 * 1. Create an account on UptimeRobot (https://uptimerobot.com/)
 * 2. Add a new monitor
 * 3. Select "HTTP(s)"
 * 4. Set a friendly name (e.g., "My Discord Bot")
 * 5. Enter your Render URL + /ping (e.g., https://your-bot-name.onrender.com/ping)
 * 6. Set monitoring interval to 5 minutes
 * 7. Create the monitor
 *
 * Now UptimeRobot will ping your bot every 5 minutes, preventing it from sleeping!
 */ 