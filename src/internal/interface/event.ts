import { DiscordClient } from '../discordClient';

export interface EventInterface {
  client: DiscordClient;
  name: string;
  once: boolean;
  execute(...args: any): void;
}
