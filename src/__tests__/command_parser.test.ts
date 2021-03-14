import {
  Client,
  Guild,
  TextChannel,
  Message,
  SnowflakeUtil,
} from 'discord.js';
import commandParser from '../commands/index';

let client: Client;
let theServer: Guild;
let testChannel: TextChannel;
let spamChannel: TextChannel;

beforeAll(async () => {

  client = new Client({
    messageCacheLifetime: 60 * 1000,
  });

  theServer = new Guild(client, {
    id: process.env['GUILD_ID'],
  });

  testChannel = new TextChannel(theServer, {
    id: process.env['TEST_CHANNEL_ID'],
    type: 'text',
  });

  spamChannel = new TextChannel(theServer, {
    id: process.env['SPAM_CHANNEL_ID'],
    type: 'text',
  });

  client.guilds.cache.set(theServer.id, theServer);
  client.channels.cache.set(testChannel.id, testChannel);
  client.channels.cache.set(spamChannel.id, spamChannel);

  await client.login(process.env['BOT_TOKEN']);

  client.on('ready', () => {
    console.log('gamesbot ready!');
    process.env['NODE_ENV'] = 'development';
  });

});

afterEach(() => {
  testChannel.messages.cache.clear();
  spamChannel.messages.cache.clear();
});

afterAll(async () => {
  await client.destroy();
});

describe('command parser', () => {

  describe('ping command', () => {

    it('should parse command alone', async () => {

      const message = new Message(client, {
        id: SnowflakeUtil.generate(),
        content: '-ping',
      }, testChannel);

      await commandParser(message);

      const [ reply ] = testChannel.messages.cache.last(1);
      expect(reply?.content).toEqual('pong');
      expect(client.user?.lastMessage?.content).toEqual('pong');

    });

    it('should parse command with argument', async () => {
      
      const message = new Message(client, {
        id: SnowflakeUtil.generate(),
        content: '-ping me',
      }, testChannel);

      await commandParser(message);

      const [ reply ] = testChannel.messages.cache.last(1);
      expect(reply?.content).toEqual('aaaarrrrgggghhhh!!!!');
      expect(client.user?.lastMessage?.content).toEqual('aaaarrrrgggghhhh!!!!');

    });

    it('should ignore commands with the wrong prefix', async () => {

      const message = new Message(client, {
        id: SnowflakeUtil.generate(),
        content: '$ping',
      }, testChannel);

      await commandParser(message);

      const [ reply ] = testChannel.messages.cache.last(1);
      expect(reply).toBeUndefined();

    });

    it('should inform user that it is in maintenance mode', async () => {

      const message = new Message(client, {
        id: SnowflakeUtil.generate(),
        content: '-ping',
      }, spamChannel);

      await commandParser(message);

      const expectedReply = `:robot: I'm in maintenance mode right now.`;
      const [ reply ] = spamChannel.messages.cache.last(1);
      expect(reply?.content).toEqual(expectedReply);
      expect(client.user?.lastMessage?.content).toEqual(expectedReply);

    });

    it('should ignore a message with just the prefix', async () => {
      
      const message = new Message(client, {
        id: SnowflakeUtil.generate(),
        content: '-',
      }, testChannel);

      await commandParser(message);

      const [ reply ] = testChannel.messages.cache.last(1);
      expect(reply).toBeUndefined();

    });

    it(`should ignore a command that doesn't exist`, async () => {

      const message = new Message(client, {
        id: SnowflakeUtil.generate(),
        content: '-foo',
      }, testChannel);

      await commandParser(message);

      const [ reply ] = testChannel.messages.cache.last(1);
      expect(reply).toBeUndefined();

    });

  });

});
