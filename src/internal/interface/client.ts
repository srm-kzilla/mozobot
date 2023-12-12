import { Collection } from 'discord.js';
import { EventInterface } from './event';

export interface ClientInterface {
  BotToken: string;
  Events?: Collection<string, EventInterface>;
  // SlashCommands: Collection<string, Command>;
  init(): void;
}
