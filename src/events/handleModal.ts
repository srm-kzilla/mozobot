import { ChannelType, ColorResolvable, EmbedBuilder, Events, Interaction } from "discord.js";
import { COLOR, FOOTER_VALUE } from "../config/constant";
import db from "../utils/database";
import { TemplateSchemaType } from "../types";

async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });

    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.startsWith("image/")) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

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
        const embeds: EmbedBuilder[] = [];
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(COLOR.WHITE as ColorResolvable)
          .setTimestamp()
          .setFooter({ text: FOOTER_VALUE });

        const image = interaction.fields.getTextInputValue("Image") || "none";
        if (image === "none") {
          if (mention === "none") {
            await channel.send({ embeds: [embed] });
          } else {
            await channel.send({ content: `📢 Announcement ${mention}`, embeds: [embed] });
          }
          await interaction.reply({ content: `Embed sent to <#${channel.id}>` });
          return;
        }
        const images = image.split("\n");
        const validImages = images.filter(url => isValidImageUrl(url));

        if (validImages.length > 0) {
          const firstImage = validImages.shift();
          if (firstImage) {
            embed.setImage(firstImage);
          }
        }
        embeds.push(embed);

        validImages.forEach(url => {
          const newEmbed = new EmbedBuilder().setImage(url).setColor(COLOR.WHITE as ColorResolvable);
          embeds.push(newEmbed);
        });
        if (mention !== "none") {
          await channel.send({ content: `📢 Announcement ${mention}`, embeds: embeds });
          await interaction.reply({ content: `Embed sent to <#${channel.id}>` });
          return;
        }
        await channel.send({ embeds: embeds });
        await interaction.reply({ content: `Embed sent to <#${channel.id}>` });
      } else if (action === "echo") {
        if (mention !== "none") {
          await channel.send({ content: `📢 Announcement ${mention}\n# ${title}\n${description}` });
          await interaction.reply({ content: `Message sent to <#${channel.id}>` });
          return;
        }

        await channel.send({ content: `# ${title}\n${description}` });
        await interaction.reply({ content: `Message sent to <#${channel.id}>` });
      }
    }
  },
};
