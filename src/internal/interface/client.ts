import { Collection } from 'discord.js';

export interface ClientInterface {
  BotToken: string;
  // SlashCommands: Collection<string, Command>;
  init(): void;
}
