import ping from './ping.js';
const guildId = process.env.GUILD_ID ?? '';
const commands = {
    ping,
};
export default async (message) => {
    const regex = /^![a-zA-Z0-9]+(\s(.+))?$/;
    if (message.guild?.id === guildId) {
        const matches = message.content.match(regex);
        if (matches === null)
            return;
        const args = message.content.split(' ');
        const commandName = args.shift()?.substr(1) ?? '';
        if (commandName in commands) {
            await commands[commandName](message, args);
        }
    }
};
//# sourceMappingURL=index.js.map