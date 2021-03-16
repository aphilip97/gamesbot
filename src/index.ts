import { Client } from 'discord.js';

import commandParser from './commands/index.js';

const client: Client = new Client();
client.once('ready', () => console.log('gamesbot is ready! :D\n'));
client.on('message', commandParser);

const exit = () => process.exit();

const cleanup = () => {
  console.log('\n[DEBUG] Cleaning up...');
  client.destroy();
  process.exit();
};

process.on('unhandledRejection', exit);
process.on('uncaughtException', exit);
process.on('SIGTERM', exit);
process.on('SIGINT', exit);
process.on('exit', cleanup);

const throwMissingEnvVarError = (key: string) => {
  throw new Error(`Missing '${key}' environment variable.`);
};

const checkEnvVarExists = (key: string) => {
  if (
    process.env.hasOwnProperty(key) === false
    || process.env[key] === void 0
  ) throwMissingEnvVarError(key);
};

checkEnvVarExists('BOT_TOKEN');
checkEnvVarExists('GUILD_ID');
checkEnvVarExists('TEST_CHANNEL_ID');
checkEnvVarExists('SPAM_CHANNEL_ID');
checkEnvVarExists('MAINTENANCE_MODE');
checkEnvVarExists('NODE_ENV');

client.login(
  process.env['BOT_TOKEN']
).then(
  (token) => {
    if (token !== process.env['BOT_TOKEN']) {
      const errMsg = [
        `[ERROR] Token mismatch after successful login.\n\n`,
        `process.env['BOT_TOKEN'] -> ${process.env['BOT_TOKEN']}\n\n`,
        `token -> ${token}\n`
      ].join('');
      const err = new Error(errMsg);
      throw err;
    }
  }
);
