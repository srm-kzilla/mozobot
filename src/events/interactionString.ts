import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, Events, Interaction } from 'discord.js';
import { Command } from '../interface';
import db from '../utils/database';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction, commands: Collection<string, Command>) {
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'deleteTemplate') {
        const selectedValue = interaction.values[0];
        const collection = (await db()).collection('templates');
        await collection.deleteOne({ description: selectedValue });
        await interaction.reply('Successfully Deleted');
      } else if (interaction.customId === 'chooseTemplate') {
        const announce = new ButtonBuilder().setCustomId('announce').setLabel('Announce').setStyle(ButtonStyle.Primary);

        const echo = new ButtonBuilder().setCustomId('echo').setLabel('Echo').setStyle(ButtonStyle.Secondary);
        const cancel = new ButtonBuilder().setCustomId('cancel').setLabel('Cancel').setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(announce, echo, cancel);
        const selectedValue = interaction.values[0];
        await interaction.reply({
          content: selectedValue,
          components: [row],
          ephemeral: true,
        });
      }
    }
  },
};
