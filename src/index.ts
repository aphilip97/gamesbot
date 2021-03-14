import { Client } from 'discord.js';

import commandParser from './commands/index.js';

const throwMissingEnvVarError = (key: string) => {
  throw new Error(`Missing '${key}' environment variable.`);
};

if (
  process.env.hasOwnProperty('BOT_TOKEN') === false
  || process.env['BOT_TOKEN'] === void 0
) throwMissingEnvVarError('BOT_TOKEN');

if (
  process.env.hasOwnProperty('GUILD_ID') === false
  || process.env['GUILD_ID'] === void 0
) throwMissingEnvVarError('GUILD_ID');

if (
  process.env.hasOwnProperty('TEST_CHANNEL_ID') === false
  || process.env['TEST_CHANNEL_ID'] === void 0
) throwMissingEnvVarError('TEST_CHANNEL_ID');

if (
  process.env.hasOwnProperty('SPAM_CHANNEL_ID') === false
  || process.env['SPAM_CHANNEL_ID'] === void 0
) throwMissingEnvVarError('SPAM_CHANNEL_ID');

if (
  process.env.hasOwnProperty('MAINTENANCE_MODE') === false
  || process.env['MAINTENANCE_MODE'] === void 0
) throwMissingEnvVarError('MAINTENANCE_MODE');

if (
  process.env.hasOwnProperty('NODE_ENV') === false
  || process.env['NODE_ENV'] === void 0
) throwMissingEnvVarError('NODE_ENV');

const client: Client = new Client();

client.once('ready', () => {
  console.log('LifeBot is ready! :D\n');
});

client.on('message', commandParser);

client.login(
  process.env['BOT_TOKEN']
).then(
  (token) => {
    if (token !== process.env['BOT_TOKEN']) {
      console.error(
        '[ERROR] Token mismatch after successful login.\n\n',
        `process.env['BOT_TOKEN'] -> ${process.env['BOT_TOKEN']}\n\n`,
        `token -> ${token}\n\n`
      );
      return;
    }
  }
).catch(
  (err) => {
    console.error(err);
    client.destroy();
    process.exit(1);
  }
);
