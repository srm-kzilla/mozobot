import { Client } from 'discord.js';
import config from './config';
import { getcommands, loadCommands, loadEvents, registerSlashCommands } from './utils';

// Initialise bot [temporary]
async function initialiseBot() {
  const client = new Client({
    intents: [32767],
  });

  try {
    await loadCommands();
    await loadEvents(client, getcommands());
    await registerSlashCommands();
    await client.login(config.botToken);
  } catch (err) {
    console.log(err);
  }
}

initialiseBot();
