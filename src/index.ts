import Discord from 'discord.js';

import commandHandler from './commands/index.js';

const client: Discord.Client = new Discord.Client();

client.once('ready', () => {
  console.log('gamesbot is ready! :D\n');
});

client.on('message', commandHandler);

client.login(process.env.BOT_TOKEN);
