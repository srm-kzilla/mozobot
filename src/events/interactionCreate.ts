// TODO: manage Commands here
import { ChatInputCommandInteraction, Events } from 'discord.js';
import { DiscordClient } from '../internal/discordClient';
import { EventInterface } from '../internal/interface/event';

export default class InteractionCreateEvent implements EventInterface {
  client: DiscordClient;
  name: Events;
  once: boolean;

  constructor(client: DiscordClient) {
    this.client = client;
    this.name = Events.InteractionCreate;
    this.once = false;
  }

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const command = this.client.Commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({ content: 'Command not found!', ephemeral: true });
      this.client.Commands.delete(interaction.commandName);
      console.warn(`Command ${interaction.commandName} not found! Removed from cache.`);
      return;
    }

    if (command.testOnly && interaction.guildId !== this.client.testGuildID) {
      await interaction.reply({ content: 'This command is only for testing purposes!', ephemeral: true });
      // re-register the command for testing purposes
      return;
    }

    try {
      await command.execute(interaction);
      return;
    } catch (error) {
      console.log(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: false });
    }
  }
}
