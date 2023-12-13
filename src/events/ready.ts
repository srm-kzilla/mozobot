import { Client, Collection, Events } from 'discord.js';
import { getcommands } from '../utils/loadCommands';

export default {
  name: Events.ClientReady,
  once: true,

  execute: async (commands: any, client: Client) => {
    console.log(`Logged in as ${client.user?.tag}`);
    console.log(commands.get('ping'));
  },
};
