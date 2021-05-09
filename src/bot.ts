import { Client } from 'discord.js';
import { EventEmitter } from 'events';
import { Command, Options } from './types';
import _debug from 'debug';
const debug = _debug('core');

export class Bot extends EventEmitter {
  public readonly client: Client;
  public readonly config: any;
  public readonly modules;

  constructor(options: Options) {
    super();
    this.client = new Client();
    this.modules = options.modules;

    // Set defaults
    this.config = Object.assign(
      {
        prefix: '!',
        ignoreBotMessages: true,
      },
      options.config
    );

    this.init();
  }

  private async init() {
    debug('init');

    // Connect to Discord
    await this.client.login(this.config.token);

    // Inititalize submodules in sequence
    for (const module of this.modules || []) {
      await module(this);
    }

    this.main();
  }

  private main() {
    // Handle messages
    this.client.on('message', (message) => {
      // Ignore private messages
      if (message.channel.type === 'dm') return;

      // Ignore bot messages
      if (this.config.ignoreBotMessages && message.author.bot) return;

      // Ignore messages not using the bot prefix
      if (message.content.indexOf(this.config.prefix) !== 0) return;

      // Get keyword and arguments
      const args = message.content
        .slice(this.config.prefix.length)
        .trim()
        .split(/ +/g);
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
