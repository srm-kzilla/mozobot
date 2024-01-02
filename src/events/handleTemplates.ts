import { Events, Interaction } from 'discord.js';
import db from '../utils/database';
import { ObjectId } from 'mongodb';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'deleteTemplate') {
        const templateID = interaction.values[0];

        const collection = (await db()).collection('templates');
        const query = { _id: new ObjectId(templateID) };
        const update = { $set: { isDeleted: true } };

        await collection.updateOne(query, update);
        await interaction.reply('Successfully Deleted');
      } else if (interaction.customId === 'chooseTemplate') {
        const templateID = interaction.values[0];
        await interaction.reply({
          content: `Use \`/announce\` or \`/echo\` command and provide with this \`${templateID}\` to use this template directly`,
        });
      }
    }
  },
};
