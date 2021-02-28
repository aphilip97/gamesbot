import { Message } from "discord.js";

export default async (message: Message) => {
  await message.channel.send('pong');
  console.log('Ping Pong! (sent)');
};
