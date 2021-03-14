import { Message } from 'discord.js';
import { Handler } from 'types/index.js';

import ping from './ping.js';

const commands: { [key: string]: Handler } = {
  ping,
};

const async_no_op = async () => {};

export default async (message: Message) => {
  /*
    TODO: Filter out messages from bots using message.author.bot
  */
  const regex = /^-[a-zA-Z0-9]+(\s(.+))?$/;
  if (message.guild?.id === process.env['GUILD_ID']) {
    const matches = message.content.match(regex);
    if (matches === null) return;
    const args = message.content.split(' ');
    const commandName = args.shift()?.substr(1) ?? '';
    if (commandName in commands) {
      if (
        process.env['MAINTENANCE_MODE'] === 'true'
        && message.channel.id !== process.env['TEST_CHANNEL_ID']
      ) {
        console.debug('In maintenance mode. Sending default response.');
        return message.channel.send(
          `:robot: I'm in maintenance mode right now.`
        );
      }
      const command = commands[commandName] ?? async_no_op;
      if (command) return command(message, ...args);
    }
  }
};
