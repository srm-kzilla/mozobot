import { DiscordClient } from '../discordClient';

export interface CommandInterface {
  client: DiscordClient;
  name: string;
  description: string;

  modOnly?: boolean;
  adminOnly?: boolean;
  testOnly?: boolean;

  options?: Object[];
  execute(...args: any): void;
}
