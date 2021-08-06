import {
  Client,
  TextChannel,
} from 'discord.js';

import commandParser from '../commands/index';
import { sendReceive } from '../utils/testing';

let client: Client;
let testCh: TextChannel;
let spamCh: TextChannel;

describe('-concentration', () => {

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

  describe('new <category>', () => {

    it('should tell you to specify a category', async () => {

      const messages = await sendReceive(
        '-concentration new',
        testCh,
      )

      const reply = messages.first();

      const expected = 'Please specify a category.';

      expect(reply?.content).toEqual(expected);

    });

    const test1 = async () => {

      const messages = await sendReceive(
        '-concentration join',
        testCh,
      );

      const reply = messages.first();

      const expected = ([
        `<@${client.user?.id}>, there is no game to join.`,
        'Would you like to make a new one using the',
        '`-concentration new <category>` command.',
      ].join(' '));

      expect(reply?.content).toEqual(expected);

    };

    it(`should not allow you to join a game that doesn't exist`, test1);

    it('should start a game', async () => {

      const messages = await sendReceive(
        '-concentration new countries',
        testCh,
      );

      const reply = messages.first();

      const expected = ([
        'New game of Concentration started.',
        'The category is countries.',
        'Use `-concentration join` to join the game.',
      ].join('\n'));

      expect(reply?.content).toEqual(expected);

    });

    const test2 = async () => {

      const messages = await sendReceive(
        '-concentration new countries',
        testCh,
      );

      const reply = messages.first();

      const expected = [
        `<@${client.user?.id}>,`,
        'Wait until the current game is finished.'
      ].join(' ');

      expect(reply?.content).toEqual(expected);
    };

    it('should reject new game if game already exists', test2);

    it('should allow a user to join the game', async () => {

      const messages = await sendReceive(
        '-concentration join',
        testCh,
      );

      const reply = messages.first();

      const expected = (
        `<@${client.user?.id}>, joined the game.`
      );

      expect(reply?.content).toEqual(expected);

    });

  });

});
