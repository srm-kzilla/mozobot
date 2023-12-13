import { Client } from 'discord.js';
import config from './config';
import { loadEvents, Commands, loadCommands, registerSlashCommands, getcommands } from './utils';

export default async function initialiseBot() {
  const client = new Client({
    intents: [32767],
  });

  try {
    await loadCommands();
    // console.log(Commands);
    await loadEvents(client, getcommands());
    // await registerSlashCommands();
    client.login(config.botToken);
  } catch (err) {
    console.log(err);
  }
}

initialiseBot();
