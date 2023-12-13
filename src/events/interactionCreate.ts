import { ChatInputCommandInteraction, Events, Interaction, Collection } from 'discord.js';
import { ICommand } from '../interface';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction, Commands: Collection<string, ICommand>) {
    if (interaction.isChatInputCommand()) {
      await handleChatCommand(interaction, Commands);
    }

    // Implement Other Interaction Types when needed
  },
};

async function handleChatCommand(interaction: ChatInputCommandInteraction, Commands: Collection<string, ICommand>) {
  const command = Commands.get(`${interaction.commandName}`);
  if (!command) {
    console.log('Command not found here', Commands);
    await interaction.reply({ content: 'Command not found', ephemeral: true });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
}
