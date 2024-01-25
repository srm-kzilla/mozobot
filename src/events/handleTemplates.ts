import { Events, Interaction, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import db from "../utils/database";
import { ObjectId } from "mongodb";

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "deleteTemplate") {
        const templateId = interaction.values[0];

        const collection = (await db()).collection("templates");
        const query = { _id: new ObjectId(templateId) };
        const update = { $set: { isDeleted: true } };

        await collection.updateOne(query, update);
        await interaction.reply("Successfully Deleted");
      } else if (interaction.customId === "chooseTemplate") {
        const { templateId, channelId } = JSON.parse(interaction.values[0] || "{}");
        const announce = new ButtonBuilder()
          .setCustomId(`announce-${templateId}-${channelId}`)
          .setLabel("Announce")
          .setStyle(ButtonStyle.Primary);
        const echo = new ButtonBuilder()
          .setCustomId(`echo-${templateId}-${channelId}`)
          .setLabel("Echo")
          .setStyle(ButtonStyle.Success);
        const button = new ActionRowBuilder<ButtonBuilder>().addComponents(announce, echo);
        await interaction.reply({
          content: "Which action would you like to perform?",
          components: [button],
          ephemeral: true,
        });
      }
    }
  },
};
