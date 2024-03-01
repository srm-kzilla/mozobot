import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  isMod: boolean;

  execute(interaction: ChatInputCommandInteraction): void;
}
