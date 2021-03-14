import { Message } from "discord.js";
import { Ping } from '../../types/index';
import { isStringArray } from '../utils/validators';

const handler: Ping = (message: Message, ...args: string[]) => {
  isStringArray(args);
  const firstArg = args[0] ?? 'foo';
  if (firstArg.toLowerCase() === 'me') {
    return message.reply('aaaarrrrgggghhhh!!!!');
  }
  return message.channel.send('pong');
};

export default handler;
