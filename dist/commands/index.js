import log from '../utils/log.js';
import ping from './ping.js';
const guildId = process.env.GUILD_ID ?? '';
const testChannelId = process.env.TEST_CHANNEL_ID ?? '';
const commands = {
    ping,
};
export default async (message) => {
    const regex = /^-[a-zA-Z0-9]+(\s(.+))?$/;
    if (message.guild?.id === guildId) {
        const matches = message.content.match(regex);
        if (matches === null)
            return;
        const args = message.content.split(' ');
        const commandName = args.shift()?.substr(1) ?? '';
        if (commandName in commands) {
            if (process.env.MAINTENANCE_MODE === 'true'
                && message.channel.id !== testChannelId) {
                log('In maintenance mode. Sending default response.');
                await message.channel.send(':robot: I\'m in maintenance mode right now.');
                log('Default response sent');
                return;
            }
            await commands[commandName](message, args);
        }
    }
};
//# sourceMappingURL=index.js.map