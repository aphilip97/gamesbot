import { Client } from 'discord.js';

describe('startup', () => {

  it('logs in', async () => {
    const client = new Client();
    try {
      const token = await client.login(process.env['BOT_TOKEN']);
      expect(token).toEqual(process.env['BOT_TOKEN']);
    } catch (err) {
      console.error(err);
    } finally {
      client.destroy();
    }
  });

  it('throws error if token is missing', async () => {
    const client = new Client();
    try {
      await client.login();
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    } finally {
      client.destroy();
    }
  });

});

export default {};
