import { Client } from 'discord.js';
import { getFiles } from './getFiles';

export async function loadEvents(client: Client, commands: any) {
  const files = await getFiles('events');
  const events: string[] = [];
  await Promise.all(
    files.map(async (file: string) => {
      try {
        const event = (await import(file)).default;
        if (!event.name) {
          console.log(`Invalid Event File: ${file}`);
          return;
        }
        const execute = (...args: any[]) => event.execute(commands, ...args);

        if (event.once) {
          client.once(event.name, execute);
        } else {
          client.on(event.name, execute);
        }
        events.push(event);
        // DEBUG: console.log(`Loaded Event: ${event.name}`);
      } catch (err) {
        console.log(`Failed to Load Event: ${file.split('/').pop()}`);
      }
    }),
  );
  console.log(`Loaded ${events.length} Events!`);
}
