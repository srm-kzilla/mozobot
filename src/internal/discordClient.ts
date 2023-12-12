import { config } from 'dotenv';
import { Client, Collection, PermissionsBitField, REST, Routes } from 'discord.js';
import { ClientInterface } from './interface/client';
import { getFiles } from '../utils/getFiles';
import { EventInterface } from './interface/event';
import { CommandInterface } from './interface/command';

config();

export class DiscordClient extends Client implements ClientInterface {
  botToken: string;
  testGuildID: string;
  clientID: string;

  Commands: Collection<string, CommandInterface>;
  Events: Collection<string, EventInterface>;

  constructor() {
    // TODO: Add Proper Intents instead using all the intents
    super({ intents: [32767] });

    // TODO: Use Loader config load these
    this.botToken = process.env.DISCORD_TOKEN as string;
    this.testGuildID = process.env.TEST_GUILD_ID as string;
    this.clientID = process.env.DISCORD_CLIENT_ID as string;

    this.Commands = new Collection();
    this.Events = new Collection();
  }

  init(): void {
    try {
      console.log('Logging In....');
      this.loadHandlers();
      this.login(this.botToken);
    } catch (err) {
      console.log('Failed to Log In!!');
      console.log(err);
    }
  }

  async loadHandlers() {
    await this.loadEventsHandler();
    await this.loadCommands();
  }

  async loadEventsHandler() {
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

  async loadCommands() {
    const files = await getFiles(this, 'commands');
    await Promise.all(
      files.map(async (file: string) => {
        try {
          const importedModule = (await import(file)).default;
          const command = new importedModule(this);
          if (!command.name) {
            console.log(`Invalid Command File: ${file}`);
            return;
          }
          this.Commands.set(command.name, command);
        } catch (err) {
          console.log(`Failed to Load Command: ${file.split('/').pop()}`);
        }
      }),
    );
    console.log(`Loaded ${this.Commands.size} Commands!`);
  }

  async getCommandData() {
    const CommandData: object[] = [];
    const TestCommandData: object[] = [];
    const res = { CommandData, TestCommandData };

    this.Commands.forEach(command => {
      if (command.testOnly) {
        TestCommandData.push({
          name: command.name,
          description: command.description,
          options: command.options,
          default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands.toString(),
          dm_permissions: command.guildOnly,
        });
      } else {
        CommandData.push({
          name: command.name,
          description: command.description,
          options: command.options,
          default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands.toString(),
          dm_permissions: command.guildOnly,
        });
      }
    });
    return res;
  }

  async registerSlashCommands() {
    const { CommandData, TestCommandData } = await this.getCommandData();

    const rest = new REST().setToken(this.botToken);
    // TODO: remove any type... Research more on this
    const setTestCommands: any = await rest.put(Routes.applicationGuildCommands(this.clientID, this.testGuildID), {
      body: TestCommandData,
    });

    console.log(`Successfully registered ${setTestCommands.length} test application commands.`);
    // TODO: remove any type... Research more on this
    // TODO: Did NOT TEST Global Commands
    const setCommands: any = await rest.put(Routes.applicationCommands(this.clientID), {
      body: CommandData,
    });

    console.log(`Successfully registered ${setCommands.length} application commands.`);
  }
}
