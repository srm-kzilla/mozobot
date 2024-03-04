import { Collection, Events, Interaction } from "discord.js";
import { Command } from "../interface";

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
    const envChannelId = process.env.CHANNEL_ID;

    if (command.isMod && interactionChannelId !== envChannelId) {
      await interaction.reply({
        content: "Permission denied. This command can only be executed in a specific channel.",
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
