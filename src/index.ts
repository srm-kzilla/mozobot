import { Client } from "discord.js";
import config from "./config";
import { getCommands, loadCommands, loadEvents, registerSlashCommands } from "./utils";

async function initialiseBot() {
  const client = new Client({
    intents: [32767],
  });

  try {
    await loadCommands();
    await loadEvents(client, getCommands());
    await registerSlashCommands();
    await client.login(config.BOT_TOKEN);
  } catch (err) {
    console.log(err);
  }
}

initialiseBot();
