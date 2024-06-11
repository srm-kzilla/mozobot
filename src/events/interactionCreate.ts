import { type Collection, Events, type GuildMemberRoleManager, type Interaction } from "discord.js";
import type { Command } from "../interface";
import env from "../config/index";

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction, commands: Collection<string, Command>) {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) {
      console.log("Command not found here", commands);
      await interaction.reply({ content: "Command not found", ephemeral: true });
      return;
    }

    const interactionChannelId = interaction.channelId;
    const envChannelId = env.MOD_CHANNEL_ID;
    const modRoleId = env.MOD_ROLE_ID;
    if (command.isMod && interactionChannelId !== envChannelId) {
      await interaction.reply({
        content: `This command can only be executed in a specific channel. <#${envChannelId}>`,
        ephemeral: true,
      });
      return;
    }

    if (command.isMod && !(interaction.member?.roles as GuildMemberRoleManager).resolve(modRoleId)) {
      await interaction.reply({
        content: "You do not have the required roles to execute this command.",
        ephemeral: true,
      });
      return;
    }

    try {
      command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
