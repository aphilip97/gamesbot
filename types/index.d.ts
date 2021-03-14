import { Message } from 'discord.js';

export type Ping = (message: Message, ...args: string[]) => Promise<Message>;

type Handler = Ping;
