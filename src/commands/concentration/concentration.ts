import {
  Collection,
  CollectorFilter,
  Message,
  MessageEmbed,
  ReactionCollector,
  TextChannel,
  User
} from "discord.js";

import { Categories, Handler } from '../../../types/index';

import { isStringArray } from '../../utils/validators';
import { loadCategories } from './categories';

type GameMap = {
  [Key in TextChannel['id']]: Concentration;
};

type GameState = 'waiting' | 'ready' | 'started' | 'finished';

const games: GameMap = {};
let categories: Categories;

loadCategories().then(
  _categories => categories = _categories
);

// const capitalize = (str: string) => {
//   const [
//     first = ''.toUpperCase(),
//     ...rest
//   ] = str.split('');
//   return `${first.toUpperCase()}${rest.join('')}`;
// };

// const createGameEmbed = (
//   category: string,
//   playerTimeoutDuration: number,
//   joinWindowDuration: number,
//   state: GameState,
//   playerList: string,
// ) => {

//   const embed = new MessageEmbed();
//   embed.setTitle('Concentration');
//   // TODO: Change the color when the game is finished
//   embed.setColor('#ff2b2b');
//   embed.setDescription([
//     'New game of Concentration started.',
//     'Click on the hand to join the game.'
//   ].join(' '));

//   embed.addFields(
//     {
//       name: 'Category',
//       value: category,
//       inline: true,
//     },
//     {
//       name: 'Player Timeout',
//       value: `${playerTimeoutDuration}s`,
//       inline: true,
//     },
//     {
//       name: 'Join Window',
//       value: `${joinWindowDuration}s`,
//       inline: true,
//     },
//     {
//       name: 'Game Status',
//       value: `${capitalize(state)}`,
//       inline: true,
//     },
//     {
//       name: 'Joined Players',
//       value: playerList,
//       inline: false,
//     },
//     // {
//     //   name: 'Current Turn Player',
//     //   value: `It is <@${this._players[this.currIndex].id}>'s turn now.`,
//     //   inline: false,
//     // },
//     // {
//     //   name: 'Next Turn Player',
//     //   value: `<@${this._players[this.currIndex + 1].id}>`,
//     //   inline: false,
//     // }
//   );

//   return embed;

// };

// TODO: Move this out into it's own file.
class Concentration {

  state: GameState = 'waiting';

  embedMsg: Message;
  collector: ReactionCollector;
  category: string;

  players: Collection<
    string, User
  > = new Collection<string, User>();

  _players: User[] = this.players.array();
  currIndex: number = 0;

  joinWindowDuration: number;
  joinWindowTimeoutID: NodeJS.Timeout;

  playerTimeoutDuration: number;
  playerTimeoutID: NodeJS.Timeout | null = null;

  constructor(
    msg: Message,
    category: string,
    joinWindow: number = 60,
    playerTimeout: number = 5,
  ) {

    this.updateEmbedMsg = this.updateEmbedMsg.bind(this);
    this.addPlayer = this.addPlayer.bind(this);
    this.removePlayer = this.removePlayer.bind(this);
    this.playerList = this.playerList.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.playerOut = this.playerOut.bind(this);
    this.resetTimeout = this.resetTimeout.bind(this);
    this.start = this.start.bind(this);
    this.destroy = this.destroy.bind(this);

    this.embedMsg = msg;
    this.category = category;
    this.joinWindowDuration = joinWindow;
    this.playerTimeoutDuration = playerTimeout;

    const filter: CollectorFilter = () => true;

    this.collector = this.embedMsg.createReactionCollector(
      filter,
      { dispose: true },
    );

    this.collector.on('collect', (_, user) => {
      if (this.state === 'started') return;
      this.addPlayer(user);
      this.updateEmbedMsg();
    });

    this.collector.on('dispose', (_, user) => {
      this.removePlayer(user);
      this.updateEmbedMsg();
    });

    this.joinWindowTimeoutID = setTimeout(
      () => {
        if (this.state === 'ready') {
          this.start();
          this.updateEmbedMsg();
        } else if (this.state === 'waiting') {
          this.embedMsg.channel.send([
            'Aborting game due to lack of players.',
            'Need at least 2 players.'
          ].join('\n'));
          this.destroy();
        }
      },
      this.joinWindowDuration * 1000,
    );

  }

  updateEmbedMsg(this: Concentration) {

    const end = this.currIndex === this._players.length - 1;
    const nextPlayerIndex = end ? 0 : this.currIndex + 1
    const currPlayer = this._players[this.currIndex];
    const nextPlayer = this._players[nextPlayerIndex];

    const stateColours = {
      'waiting': 'ff2b2b' as const,
      'ready': 'f4ea2a' as const,
      'started': '37ff29' as const,
      'finished': '299bff' as const,
    };

    const embed = new MessageEmbed();
    embed.setTitle('Concentration');
    embed.setColor(`#${stateColours[this.state]}`);
    embed.setDescription([
      'New game of Concentration started.',
      'Click on the hand to join the game.'
    ].join(' '));

    const fields = [
      {
        name: 'Category',
        value: this.category,
        inline: true,
      },
      {
        name: 'Player Timeout',
        value: `${this.playerTimeoutDuration}s`,
        inline: true,
      },
      {
        name: 'Join Window',
        value: `${this.joinWindowDuration}s`,
        inline: true,
      },
      {
        name: 'Joined Players',
        value: this.playerList(),
        inline: false,
      },
    ];

    if (this.state === 'started') fields.push(
      {
        name: 'Current Turn Player',
        value: `<@${currPlayer?.id}>`,
        inline: true,
      },
      {
        name: 'Next Turn Player',
        value: `<@${nextPlayer?.id}>`,
        inline: true,
      },
    );

    embed.addFields(fields);
    this.embedMsg.edit(embed);

  }

  addPlayer(this: Concentration, player: User) {
    this.players.set(player.id, player);
    if (this.players.size >= 2) {
      this.state = 'ready';
    }
  }

  removePlayer(this: Concentration, player: User) {
    this.players.delete(player.id);
    if (this.players.size < 2) {
      this.state = 'waiting';
    }
  }

  playerList(this: Concentration) {
    const players = this.players.values();
    const atUser = (user: User) => `<@${user.id}>`;
    const list = [...players].map(atUser).join(', ');
    if (list === '') return 'No players have joined yet.';
    return list;
  }

  handleMessage(this: Concentration, msg: Message) {

    if (this.state !== 'started') return;
    if (msg.author.bot) return;

    if (
      msg.author.id === this._players[this.currIndex]?.id
    ) {

      const category = categories[this.category];
      const end = this.currIndex === this._players.length - 1;

      if (category?.check(msg.content)) {

        // Player answered correctly. Move on to next player.
        this.currIndex = end ? 0 : this.currIndex + 1;
        msg.edit(`${msg.content} :white_check_mark:`);
        this.resetTimeout();

      } else {

        // Player answered incorrectly. Disqualify them.
        this._players.splice(this.currIndex, 1);
        this.currIndex = end ? 0 : this.currIndex;
        msg.edit(`${msg.content} :x:`);
        this.resetTimeout();

      }
    }

  }

  playerOut(this: Concentration) {

    if (this.state !== 'started') return;

    const currPlayerID = this._players[this.currIndex]?.id;
    const outMsg = `<@${currPlayerID}>, Times up! Your out!`;
    this.embedMsg.channel.send(outMsg);

    const end = this.currIndex === this._players.length - 1;

    this._players.splice(this.currIndex, 1);
    this.currIndex = end ? 0 : this.currIndex;
    this.resetTimeout();

  }

  resetTimeout(this: Concentration) {

    if (this.playerTimeoutID) {
      clearTimeout(this.playerTimeoutID);
    }

    if (this._players.length > 1) {

      setTimeout(
        this.playerOut,
        this.playerTimeoutDuration * 1000,
      );
      this.updateEmbedMsg();

    } else if (this._players.length === 1) {

      this.embedMsg.channel.send(
        `Congratulations <@${this._players[0]?.id}>! You won!`
      );
      this.updateEmbedMsg();
      this.destroy();

    } else throw new Error('Winner not found.');

  }

  start(this: Concentration) {

    this._players.push(...this.players.values());

    this.embedMsg.client.on('message', this.handleMessage);

    this.playerTimeoutID = setTimeout(
      this.playerOut,
      this.playerTimeoutDuration * 1000
    );

    this.state = 'started';

  }

  destroy(this: Concentration) {
    this.embedMsg.client.removeListener(
      'message', this.handleMessage
    );
    if (this.playerTimeoutID !== null) {
      clearTimeout(this.playerTimeoutID);
    }
    categories[this.category]?.refreshData();
    delete games[this.embedMsg.channel.id];
  }

}

const handler: Handler = async (
  msg: Message,
  ...args: string[]
) => {

  isStringArray(args);

  const channelID = msg.channel.id;

  const subCmd = (args[0] ?? '').toLowerCase();
  const category = (args[1] ?? '').toLowerCase();
  let playerTimeout = parseFloat(args[2] ?? '5');
  let joinWindow = parseFloat(args[3] ?? '60');

  if (subCmd === 'new') {

    // Return if a game already exists in this channel.
    if (games[channelID]) return await msg.reply(
      'Wait until the current game is finished.',
    );

    // Return if the category was not specified
    if (category === '') return await msg.channel.send([
      'Please specify a category.',
      'Like so `-concentration <name_of_category>`.',
      'For a category list, use `-concentration categories`.',
    ].join('\n'));

    // Return if invalid number was provided for player timeout.
    if (isNaN(playerTimeout)) return await msg.channel.send(
      `Failed to parse ${args[2]} for player timeout argument.`,
    );

    // Return if invalid number was provided for join window.
    if (isNaN(joinWindow)) return await msg.channel.send(
      `Failed to parse ${args[3]} for join window argument.`,
    );

    if (category in categories) {

      // Make sure this can't be started from anywhere other
      // than a regular TextChannel on the server.
      if (msg.channel instanceof TextChannel) {

        const embed = new MessageEmbed();
        embed.setTitle('Concentration');
        embed.setColor('#ff2b2b');
        embed.setDescription([
          'New game of Concentration started.',
          'Click on the hand to join the game.'
        ].join(' '));

        embed.addFields(
          {
            name: 'Category',
            value: category,
            inline: true,
          },
          {
            name: 'Player Timeout',
            value: `${playerTimeout}s`,
            inline: true,
          },
          {
            name: 'Join Window',
            value: `${joinWindow}s`,
            inline: true,
          },
          {
            name: 'Joined Players',
            value: `\u200B`,
            inline: false,
          },
        );

        const embedResponseMsg = await msg.channel.send(embed);

        games[channelID] = new Concentration(
          embedResponseMsg, category, playerTimeout, joinWindow
        );

        setTimeout(async () => {
          await embedResponseMsg.react('🖐');
        }, 5000);

        return embedResponseMsg;

      }

    }

    // Return if category is not yet supported.
    return await msg.channel.send([
      'Unknown category.',
      'Use `-concentration categories` for a list.',
    ].join(' '));

  } else if (subCmd === 'categories') {

    return await msg.channel.send('/shrug Work in progress.');

  } else if (subCmd === 'help') {

    return await msg.channel.send('/shrug Work in progress.');

  }

  return await msg.channel.send([
    `Something went wrong when trying to run the`,
    `\`${msg.content}\` command.`,
  ].join(' '));

};

export default handler;
