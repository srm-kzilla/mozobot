import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  isMod: Boolean;

  execute(interaction: ChatInputCommandInteraction): void;
}
