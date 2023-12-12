import { ChatInputCommandInteraction } from 'discord.js';
import { DiscordClient } from '../discordClient';

// TODO: This Interface is not good enough... Need to improve it
export interface CommandInterface {
  client: DiscordClient;
  name: string;
  description: string;
  category: string;

  guildOnly?: boolean;
  modOnly?: boolean;
  adminOnly?: boolean;
  testOnly?: boolean;

  options: Object[];

  execute(interaction: ChatInputCommandInteraction, ...args: any): void;
}
