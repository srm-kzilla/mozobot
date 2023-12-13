import { Collection, REST, Routes } from 'discord.js';
import { ICommand } from '../interface';
import config from '../config';
import { getFiles } from './getFiles';

const Commands: Collection<string, ICommand> = new Collection();
const commandsData: JSON[] = [];

export async function loadCommands() {
  const files = await getFiles('commands');

  await Promise.all(
    files.map(async (file: string) => {
      try {
        const command = (await import(file)).default;
        if (!command.data.name) {
          console.log(`Invalid Event File: ${file}`);
          return;
        }
        Commands.set(command.data.name, command);
        commandsData.push(command.data.toJSON());
      } catch (err) {
        console.log(`Failed to Load Event: ${file.split('/').pop()}`);
      }
    }),
  );
  console.log(`Loaded ${Commands.size} commands.`);
}

export async function registerSlashCommands() {
  const rest = new REST().setToken(config.botToken);

  const setCommands: any = await rest.put(Routes.applicationGuildCommands(config.clientID, config.testGuildID), {
    body: commandsData,
  });

  console.log(`Successfully registered ${setCommands.length} application commands.`);
}

export function getcommands() {
  return Commands;
}

// let see if this works
export { Commands };
