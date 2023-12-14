import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface CommandInterface {
  data: SlashCommandBuilder;

  execute(interaction: ChatInputCommandInteraction, ...args: any): void;
}
