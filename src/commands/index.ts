import { Message } from 'discord.js';
import { Handler } from 'types/index.js';

import ping from './ping.js';

// Prefix
const p = '-';

const cmds: { [key: string]: Handler } = {
  ping,
};

const async_no_op = async () => {};

export default async (msg: Message) => {
  if (msg.content.startsWith(p) === false) return;

  const args = msg.content.slice(p.length).trim().split(/ +/);

  const cmdName = args.shift()?.toLowerCase() ?? '';

  if (cmdName in cmds) {
    if (
      process.env['MAINTENANCE_MODE'] === 'true'
      && msg.channel.id !== process.env['TEST_CHANNEL_ID']
    ) {
      return msg.channel.send(
        `:robot: I'm in maintenance mode right now.`
      );
    }
    const cmd = cmds[cmdName] ?? async_no_op;
    if (cmd) return cmd(msg, ...args);
  }

};
