import { Client, Collection, Events } from 'discord.js';
import { getcommands } from '../utils/loadCommands';

export default {
  name: Events.ClientReady,
  once: true,

  execute: async (client: Client) => {
    console.log(`Logged in as ${client.user?.tag}`);
  },
};
