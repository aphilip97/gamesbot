import {
  Client,
  TextChannel,
} from 'discord.js';

import commandParser from '../commands/index';
import { sendReceive } from '../utils/testing';

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
        false,
      ) as TextChannel;
    }

    if (process.env['SPAM_CHANNEL_ID'] !== void 0) {
      const allChannels = client.channels;
      spamCh = await allChannels.fetch(
        process.env['SPAM_CHANNEL_ID'],
        true,
        false,
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

  it('should parse command alone', async () => {

    const messages = await sendReceive(
      '-ping',
      testCh
    );

    const reply = messages.first();

    const expected = 'pong';

    expect(reply?.content).toEqual(expected);

  });

  it('should parse command with argument', async () => {

    const messages = await sendReceive(
      '-ping me',
      testCh
    );

    const reply = messages.first();

    const expected = (
      `<@${client.user?.id}>, aaaarrrrgggghhhh!!!!`
    );

    expect(reply?.content).toEqual(expected);

  });

  it('should ignore commands with the wrong prefix', async () => {

    const messages = await sendReceive(
      '$ping',
      testCh,
      void 0,
      { errors: [], time: 5000, }
    );

    const reply = messages.first();

    const expected = void 0;

    expect(reply?.content).toEqual(expected);

  });

  it('should inform user that it is in maintenance mode', async () => {

    const messages = await sendReceive(
      '-ping',
      spamCh
    );

    const reply = messages.first();

    const expected = (
      `:robot: I'm in maintenance mode right now.`
    );

    expect(reply?.content).toEqual(expected);

  });

  it('should ignore a message with just the prefix', async () => {

    const messages = await sendReceive(
      '-',
      testCh
    );

    const reply = messages.first();

    const expected = 'Command not recognized.';

    expect(reply?.content).toEqual(expected);

  });

  it(`should ignore a command that doesn't exist`, async () => {

    const messages = await sendReceive(
      '-foo',
      testCh
    );

    const reply = messages.first();

    const expected = 'Command not recognized.';

    expect(reply?.content).toEqual(expected);

  });

});
