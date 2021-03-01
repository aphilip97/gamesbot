import express from 'express';
import Discord from 'discord.js';

import commandHandler from './commands/index.js';

const client: Discord.Client = new Discord.Client();

client.once('ready', () => {
  console.log('LifeBot is ready! :D\n');
});

client.on('message', commandHandler);

client.login(process.env.BOT_TOKEN);

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`LifeBot is listening on port ${port}`);
});
