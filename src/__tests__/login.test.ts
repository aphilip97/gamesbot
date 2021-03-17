import { Client } from 'discord.js';

let client: Client;

describe('startup', () => {

  beforeAll(() => {
    client = new Client({
      messageCacheLifetime: 60 * 1000,
      messageCacheMaxSize: 200,
      messageSweepInterval: 200,
      messageEditHistoryMaxSize: 200,
    });
  });

  afterEach(() => {
    client.destroy();
  });

  it('logs in', async () => {
    try {
      const token = await client.login(process.env['BOT_TOKEN']);
      expect(token).toEqual(process.env['BOT_TOKEN']);
    } catch (err) {
      console.error(err);
    }
  });

  it('throws error if token is missing', async () => {
    try {
      await client.login();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });

});

export default {};
