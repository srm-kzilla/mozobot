import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface ICommand {
  data: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction, ...args: any): void;
}
