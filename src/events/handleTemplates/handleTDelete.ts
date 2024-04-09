import { Events, Interaction, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import db from "../../utils/database";
import { ObjectId } from "mongodb";

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "deleteTemplate") return;
    const templateId = interaction.values[0];

    const collection = (await db()).collection("templates");
    const query = { _id: new ObjectId(templateId) };
    const update = { $set: { isDeleted: true } };

    await collection.updateOne(query, update);
    await interaction.reply("Successfully Deleted the template.");
  },
};
