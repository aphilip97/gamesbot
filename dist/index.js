import Discord from 'discord.js';
import commandHandler from './commands/index.js';
const client = new Discord.Client();
client.once('ready', () => {
    console.log('LifeBot is ready! :D\n');
});
client.on('message', commandHandler);
client.login(process.env.BOT_TOKEN);
//# sourceMappingURL=index.js.map