import { DiscordClient } from '../internal/discordClient';
import { EventInterface } from '../internal/interface/event';

export default class event implements EventInterface {
  name = 'ready';
  once = true;
  client: DiscordClient;

  constructor(client: DiscordClient) {
    this.client = client;
  }

  async execute() {
    console.log(`Logged in as ${this.client.user?.tag}`);
  }
}
