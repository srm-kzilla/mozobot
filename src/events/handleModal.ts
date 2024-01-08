import { ChannelType, ColorResolvable, EmbedBuilder, Events, Interaction } from "discord.js";
import { COLOR } from "../config/constant";
import db from "../utils/database";
import { TemplateSchemaType } from "../types";

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.guild) return;
    if (!interaction.isModalSubmit()) return;
    const title = interaction.fields.getTextInputValue("Title");
    const description = interaction.fields.getTextInputValue("Description");

    const [action, channelId, mention] = interaction.customId.split("-");

    if (action === "template") {
      const data = await (await db())
        .collection("templates")
        .find({ guildId: interaction.guildId, isDeleted: false })
        .toArray();
      if (data.length >= 25) {
        return interaction.reply({ content: "You can only have max 25 templates", ephemeral: true });
      }

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
        isDeleted: false,
      });
      await interaction.reply({ content: "Template added to database!" });
    } else {
      if (!action || !channelId) return;

      const channel = interaction.guild.channels.cache.get(channelId);

      if (!channel) {
        await interaction.reply({ content: "Target Channel Not Found", ephemeral: true });
        return;
      }

      if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
        await interaction.reply({ content: "Invalid Channel Provided. Please Provide a text channel" });
        return;
      }

      if (action === "announce") {
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(COLOR.WHITE as ColorResolvable);

        if (mention === "@here" || mention === "@everyone") {
          await channel.send({ content: `${mention}`, embeds: [embed] });
          await interaction.reply({ content: `Announcement sent to <#${channel.id}>` });
          return;
        }

        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: `Announcement sent to <#${channel.id}>` });
      } else if (action === "echo") {
        if (mention === "@here" || mention === "@everyone") {
          await channel.send({ content: `${mention}\n# ${title}\n${description}` });
          await interaction.reply({ content: `Announcement sent to <#${channel.id}>` });
          return;
        }

        await channel.send({ content: `# ${title}\n${description}` });
        await interaction.reply({ content: `Announcement sent to <#${channel.id}>` });
      }
    }
  },
};
