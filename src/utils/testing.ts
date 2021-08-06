import {
  TextChannel,
  CollectorFilter,
  AwaitMessagesOptions
} from "discord.js";

const sendReceive = async (
  msgContent: string,
  channel: TextChannel,
  replyFilter: CollectorFilter = () => true,
  awaitMsgOptions?: AwaitMessagesOptions,
) => {
  await channel.send(msgContent);
  return await channel.awaitMessages(replyFilter, {
    errors: ['time'],
    max: 1,
    maxProcessed: 1,
    time: 1000,
    // idle: 5000,
    // dispose: false,
    ...awaitMsgOptions
  });
};

export { sendReceive };
