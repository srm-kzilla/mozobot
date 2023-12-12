import { Events } from 'discord.js';
import { DiscordClient } from '../internal/discordClient';
import { EventInterface } from '../internal/interface/event';

export default class event implements EventInterface {
  client: DiscordClient;
  name: Events;
  once: boolean;

  constructor(client: DiscordClient) {
    this.client = client;
    this.name = Events.ClientReady;
    this.once = true;
  }

  async execute() {
    console.log(`Logged in as ${this.client.user?.tag}`);
  }
}
