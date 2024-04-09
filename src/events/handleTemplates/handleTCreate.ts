import { Events, Interaction } from "discord.js";
import z from "zod";
import { TemplateSchemaType } from "../../types";
import db from "../../utils/database";
import isValidImageUrl from "../../utils/misc";

const isValidUrl = (url: string): boolean => z.string().url().safeParse(url).success;

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.guild) return;
    if (!interaction.isModalSubmit()) return;
    const [action] = interaction.customId.split("-");

    if (action !== "template") return;
    const title = interaction.fields.getTextInputValue("title");
    const description = interaction.fields.getTextInputValue("description");
    const image = interaction.fields.getTextInputValue("image") || "";
    const images = image.split("\n");
    const validUrl = images.filter(url => isValidUrl(url));
    const validImages = validUrl.filter(url => isValidImageUrl(url));

    const data = await (await db())
      .collection("templates")
      .find({ guildId: interaction.guildId, isDeleted: false })
      .toArray();
    if (data.length >= 25) {
      return interaction.reply({ content: "You can only have max 25 templates", ephemeral: false });
    }

    // TODO: remove check for title cause i think not required
    const templateExists = data.some(template => template.title === title || template.description === description);

    if (templateExists) {
      return interaction.reply({
        content: "Template with the same title and description already exists",
        ephemeral: true,
      });
    }

    await (await db()).collection<TemplateSchemaType>("templates").insertOne({
      title,
      description,
      guildId: interaction.guild.id,
      images: validImages,
      isDeleted: false,
    });
    await interaction.reply({ content: "Template added to database!" });
  },
};
