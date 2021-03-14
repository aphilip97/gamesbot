import { Client } from 'discord.js';

import commandParser from './commands/index.js';

const throwMissingEnvVarError = (key: string) => {
  throw new Error(`Missing '${key}' environment variable.`);
};

if (process.env['BOT_TOKEN'] === '') throwMissingEnvVarError('BOT_TOKEN');
if (process.env['GUILD_ID'] === '') throwMissingEnvVarError('GUILD_ID');
if (process.env['TEST_CHANNEL_ID'] === '') throwMissingEnvVarError('TEST_CHANNEL_ID');
if (process.env['SPAM_CHANNEL_ID'] === '') throwMissingEnvVarError('SPAM_CHANNEL_ID');
if (process.env['MAINTENANCE_MODE'] === '') throwMissingEnvVarError('MAINTENANCE_MODE');
if (process.env['NODE_ENV'] === '') throwMissingEnvVarError('NODE_ENV');

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
