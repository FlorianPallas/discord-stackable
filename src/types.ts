import { Message } from 'discord.js';
import { Bot } from './bot';

export type Module = (bot: Bot) => Promise<void>;
export interface Options {
  config?: any;
  modules?: Module[];
}

export interface Command {
  keyword: string;
  args: string[];
  message: Message;
}
