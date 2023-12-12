import { Events } from 'discord.js';
import { DiscordClient } from '../discordClient';

export interface EventInterface {
  client: DiscordClient;
  name: Events;
  once: boolean;
  execute(...args: any): void;
}
