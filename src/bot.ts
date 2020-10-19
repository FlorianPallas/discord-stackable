import { Client } from 'discord.js';
import { EventEmitter } from 'events';
import { Command, Options } from './types';
import _debug from 'debug';
const debug = _debug('core');

export class Bot extends EventEmitter {
  public readonly client: Client;

  constructor(private options: Options) {
    super();
    this.client = new Client();
    this.init();
  }

  private async init() {
    debug('init');

    // Connect to Discord
    await this.client.login(this.options.config.token);

    // Inititalize submodules in sequence
    for (const module of this.options.modules || []) {
      await module(this);
    }

    this.main();
  }

  private main() {
    // Handle messages
    this.client.on('message', (message) => {
      // Ignore bot messages
      if (message.author.bot) return;

      // Get keyword and arguments
      const args = message.content.slice('!'.length).trim().split(/ +/g);
      const keyword = args.shift();
      if (keyword === undefined) {
        return;
      }

      // Emit command event
      const command = { keyword, args, message };
      this.emit('command', command);
    });
  }
}

// Declare event types
export declare interface Bot {
  on: (event: 'command', listener: (command: Command) => void) => this;
}
