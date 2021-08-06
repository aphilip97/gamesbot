import {
  CollectorFilter,
  Message,
  MessageEmbed,
  ReactionCollector,
  TextChannel,
  User
} from "discord.js";
import { Handler } from '../../types/index';
import { isStringArray } from '../utils/validators';

type PingTracker = {
  [Key in TextChannel['id']]: PingEmbedTracker;
};

const pings: PingTracker = {};

class PingEmbedTracker {

  count: number = 0;
  embedMsg: Message;
  collector: ReactionCollector;
  timeoutID: NodeJS.Timeout;
  timeoutDuration: number;
  timesUp: boolean = false;

  constructor(msg: Message, timeoutDuration: number = 60000) {

    this.updateEmbedMessage = this.updateEmbedMessage.bind(this);
    this.destroy = this.destroy.bind(this);

    console.log(`New Ping Tracker Created!\n`);

    this.embedMsg = msg;
    this.timeoutDuration = timeoutDuration;

    const filter: CollectorFilter = () => true;

    this.collector = msg.createReactionCollector(
      filter,
      { dispose: true },
    );

    // await this.collector.message.reactions.removeAll();
    // this.collector.removeAllListeners();

    this.collector.on('collect', (_, user) => {
      if (this.timesUp) return;
      // console.log(`[ EVENT ] [ COLLECT ]`, reaction.emoji.name);
      this.count++;
      this.updateEmbedMessage(user);
    });

    this.collector.on('dispose', (_, user) => {
      if (this.timesUp) return;
      // console.log(`[ EVENT ] [ DISPOSE ]`, reaction.emoji.name);
      this.count--;
      this.updateEmbedMessage(user);
    });

    this.timeoutID = setTimeout(
      () => {
        // console.log(`[ EVENT ] [ CUSTOM  ] 🕛`);
        this.timesUp = true;
      },
      this.timeoutDuration,
    );

  }

  updateEmbedMessage(this: PingEmbedTracker, user: User) {

    let latestEmbed = this.embedMsg.embeds[
      this.embedMsg.embeds.length - 1
    ];

    if (latestEmbed) {

      const [f1, f2] = latestEmbed.fields ?? [];
      if (f1) f1.value = `<@${user.id}>`;
      if (f2) f2.value = `${this.count}`;

    } else {

      latestEmbed = new MessageEmbed();
      latestEmbed.setColor('#ff2b2b');
      latestEmbed.setTitle('PONG!');
      latestEmbed.setDescription(
        'Tracks the total number of reactions to this message in the first 60 seconds.'
      );

      latestEmbed.addFields(
        {
          name: 'Latest Reactor',
          value: `<@${user.id}>`,
          inline: true
        },
        {
          name: 'Reaction Count',
          value: 0,
          inline: true
        },
      );

    }

    this.embedMsg.edit(latestEmbed);

  }

  destroy(this: PingEmbedTracker) {
    clearTimeout(this.timeoutID);
    this.collector.removeListener('collect', () => { });
    // this.collector.removeListener('remove', () => { });
    this.collector.removeListener('dispose', () => { });
    // this.embedMsg.client.removeListener('messageReactionRemove', () => { });
  }

}

const handler: Handler = async (
  msg: Message,
  ...args: string[]
) => {

  isStringArray(args);

  const embed = new MessageEmbed();
  embed.setColor('#ff2b2b');
  embed.setTitle('PONG!');
  embed.setDescription(
    'Tracks the total number of reactions to this message in the first 60 seconds.'
  );

  embed.addFields(
    {
      name: 'Latest Reactor',
      value: `<@${msg.client.user?.id}>`,
      inline: true
    },
    {
      name: 'Reaction Count',
      value: 0,
      inline: true
    },
  );

  const embedMsg = await msg.channel.send(embed);
  pings[msg.channel.id]?.destroy();
  delete pings[msg.channel.id];
  pings[msg.channel.id] = new PingEmbedTracker(embedMsg);
  return embedMsg;

};

export default handler;
