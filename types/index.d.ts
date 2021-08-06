import { Message } from 'discord.js';

type Handler = (message: Message, ...args: string[]) => Promise<Message>;

type Lookup = {
  [key: string]: null;
};

type Category = {
  data: Lookup;
  mutableData: Lookup;
  check: (val: string) => boolean;
  refreshData: () => void;
};

type Categories = {
  [key: string]: Category;
};
