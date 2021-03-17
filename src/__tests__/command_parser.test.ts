import {
  Client,
  TextChannel,
  Message,
  CollectorFilter,
  AwaitMessagesOptions,
} from 'discord.js';
import commandParser from '../commands/index';

let client: Client;
let testCh: TextChannel;
let spamCh: TextChannel;

describe('command parser', () => {

  beforeAll(async () => {

    client = new Client({
      messageCacheLifetime: 60 * 1000,
      messageCacheMaxSize: 200,
      messageSweepInterval: 200,
      messageEditHistoryMaxSize: 200,
    });

    client.on('message', commandParser);

    await client.login(process.env['BOT_TOKEN']);

    if (process.env['TEST_CHANNEL_ID'] !== void 0) {
      const allChannels = client.channels;
      testCh = await allChannels.fetch(
        process.env['TEST_CHANNEL_ID'],
        true,
        false
      ) as TextChannel;
    }

    if (process.env['SPAM_CHANNEL_ID'] !== void 0) {
      const allChannels = client.channels;
      spamCh = await allChannels.fetch(
        process.env['SPAM_CHANNEL_ID'],
        true,
        false
      ) as TextChannel;
    }

  });

  afterAll(() => {
    client.destroy();
  });

  afterEach(() => {
    testCh.messages.cache.clear();
    spamCh.messages.cache.clear();
  });

  const sendReceive = async (
    msgContent: string,
    channel: TextChannel,
    replyFilter: CollectorFilter,
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

  it('should parse command alone', async () => {

    const filter: CollectorFilter = (msg: Message) => (
      msg.content === 'pong'
    );

    const messages = await sendReceive('-ping', testCh, filter);

    const reply = messages.find(msg => msg.content === 'pong');

    expect(reply?.content).toEqual('pong');

  });

  it('should parse command with argument', async () => {

    const filter: CollectorFilter = (msg: Message) => (
      msg.content.includes('aaaarrrrgggghhhh!!!!')
    );

    const messages = await sendReceive('-ping me', testCh, filter);

    const reply = messages.first();

    expect(reply?.content).toContain('aaaarrrrgggghhhh!!!!');

  });

  it('should ignore commands with the wrong prefix', async () => {

    const filter: CollectorFilter = () => true;

    const messages = await sendReceive('$ping', testCh, filter, {
      errors: [],
    });

    const reply = messages.first();

    expect(reply).toBeUndefined();

  });

  it('should inform user that it is in maintenance mode', async () => {

    const filter: CollectorFilter = (msg: Message) => (
      msg.content === `:robot: I'm in maintenance mode right now.`
    );

    const messages = await sendReceive('-ping', spamCh, filter);

    const expectedReply = `:robot: I'm in maintenance mode right now.`;

    const reply = messages.first();
    expect(reply?.content).toEqual(expectedReply);

  });

  it('should ignore a message with just the prefix', async () => {

    const filter: CollectorFilter = () => true;

    const messages = await sendReceive('-', testCh, filter, {
      errors: [],
    });

    const reply = messages.first();

    expect(reply).toBeUndefined();

  });

  it(`should ignore a command that doesn't exist`, async () => {

    const filter: CollectorFilter = () => true;

    const messages = await sendReceive('-foo', testCh, filter, {
      errors: [],
    });

    const reply = messages.first();

    expect(reply).toBeUndefined();

  });

});
