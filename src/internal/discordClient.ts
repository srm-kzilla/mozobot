import { config } from 'dotenv';
import { Client, Collection, Events } from 'discord.js';
import { ClientInterface } from './interface/client';
import { getFiles } from '../utils/getFiles';
import { EventInterface } from './interface/event';

config();

export class DiscordClient extends Client implements ClientInterface {
  BotToken: string;
  Events: Collection<string, EventInterface>;

  constructor() {
    // TODO: Add Proper Intents instead using all the intents
    super({ intents: [32767] });
    this.BotToken = process.env.DISCORD_TOKEN as string;
    this.Events = new Collection();
  }

  init(): void {
    try {
      console.log('Logging In....');
      this.loadEvents();
      this.login(this.BotToken);
    } catch (err) {
      console.log('Failed to Log In!!');
      console.log(err);
    }
  }

  async loadEvents() {
    const files = await getFiles(this, 'events');
    await Promise.all(
      files.map(async (file: string) => {
        try {
          const importedModule = (await import(file)).default;
          const event = new importedModule(this);
          if (!event.name) {
            console.log(`Invalid Event File: ${file}`);
            return;
          }
          const execute = (...args: any[]) => event.execute(...args);

          if (event.once) {
            this.once(event.name, execute);
          } else {
            this.on(event.name, execute);
          }
          this.Events.set(event.name, event);
          // DEBUG: console.log(`Loaded Event: ${event.name}`);
        } catch (err) {
          console.log(`Failed to Load Event: ${file.split('/').pop()}`);
        }
      }),
    );
    console.log(`Loaded ${this.Events.size} Events!`);
  }
}
