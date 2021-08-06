import { Message } from 'discord.js';
import { Handler } from 'types/index.js';

import { PREFIX as p } from '../constants';
import ping from './ping.js';
import concentration from './concentration/concentration';

const cmds: { [key: string]: Handler } = {
  ping,
  concentration,
};

const notFound = async (msg: Message) => msg.channel.send(
  `Command not recognized.`
);

export default async (msg: Message) => {

  if (msg.content.startsWith(p) === false) return;

  const args = msg.content.slice(p.length).trim().split(/ +/);

  const cmdName = args.shift()?.toLowerCase() ?? '';

  if (
    process.env['MAINTENANCE_MODE'] === 'true'
    && msg.channel.id !== process.env['TEST_CHANNEL_ID']
  ) {

    await msg.channel.send(
      `:robot: I'm in maintenance mode right now.`
    );

    return;

  }

  const cmd = cmds[cmdName] ?? notFound;

  await cmd(msg, ...args);

};
