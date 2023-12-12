import { Collection } from 'discord.js';
import { EventInterface } from './event';
import { CommandInterface } from './command';

export interface ClientInterface {
  botToken: string;
  testGuildID: string;
  clientID: string;

  Commands?: Collection<string, CommandInterface>;
  Events?: Collection<string, EventInterface>;

  init(): void;

  loadHandlers(): void;
  loadEventsHandler(): void;
  loadCommands(): void;

  getCommandData(): object;
  registerSlashCommands(): void;
}
