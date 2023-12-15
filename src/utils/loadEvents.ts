import { Client } from 'discord.js';
import { getFiles } from './getFiles';

export async function loadEvents(client: Client, commands: any) {
  const files = await getFiles('events');
  const events: string[] = [];
  await Promise.all(
    files.map(async (file: string) => {
      try {
        const { default: event } = (await import(file)).default;
        if (!event.name) {
          console.log(`Invalid Event File: ${file}`);
          return;
        }
        const execute = (...args: any[]) => event.execute(...args, commands);

        if (event.once) {
          client.once(event.name, execute);
        } else {
          client.on(event.name, execute);
        }
        events.push(event);
      } catch (err) {
        console.log(`Failed to Load Event: ${file.split('/').pop()}`);
        console.log(err);
      }
    }),
  );
  console.log(`Loaded ${events.length} Events!`);
}
