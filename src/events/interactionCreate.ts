import { ChatInputCommandInteraction, Events, Interaction } from 'discord.js';
import { Commands } from '../utils/loadCommands';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      await handleChatCommand(interaction);
    }

    // Implement Other Interaction Types when needed
  },
};

async function handleChatCommand(interaction: ChatInputCommandInteraction) {
  console.log(`--> ${interaction.commandName}`);
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
