import { ChatInputCommandInteraction, Collection, Events, Interaction } from 'discord.js';
import { CommandInterface } from '../interface';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction, Commands: Collection<string, CommandInterface>) {
    if (!interaction.isChatInputCommand()) return;
    await handleChatCommand(interaction, Commands);

    const command = Commands.get(interaction.commandName);
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
  },
};

async function handleChatCommand(
  interaction: ChatInputCommandInteraction,
  Commands: Collection<string, CommandInterface>,
) {}
