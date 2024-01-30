import {
  ChannelType,
  ColorResolvable,
  EmbedBuilder,
  Events,
  Interaction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Message,
} from "discord.js";
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
    const [action, channelId, mention, messageId, type] = interaction.customId.split("-");
    let message: Message;

    if (action === "template") {
      const image = interaction.fields.getTextInputValue("image") || "";
      const images = image.split("\n");
      const validImages = images.filter(url => isValidImageUrl(url));

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
        images: validImages,
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
      const createComponent = (messageId: string): ActionRowBuilder<ButtonBuilder> => {
        const edit_message = new ButtonBuilder()
          .setCustomId(`edit--${channelId}-${messageId}-${action}`)
          .setLabel("Edit")
          .setStyle(ButtonStyle.Primary);
        const delete_message = new ButtonBuilder()
          .setCustomId(`delete--${channelId}-${messageId}`)
          .setLabel("Delete")
          .setStyle(ButtonStyle.Danger);
        return new ActionRowBuilder<ButtonBuilder>().addComponents(edit_message, delete_message);
      };

      if (action === "announce") {
        const image = interaction.fields.getTextInputValue("image") || "none";
        const images = image.split("\n");
        const validImages = images.filter(url => isValidImageUrl(url));

        const embeds: EmbedBuilder[] = [];
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(COLOR.WHITE as ColorResolvable)
          .setTimestamp()
          .setFooter({ text: FOOTER_VALUE });

        if (image === "none") {
          if (mention === "none") {
            message = await channel.send({ embeds: [embed] });
          } else {
            message = await channel.send({ content: `📢 Announcement ${mention}`, embeds: [embed] });
          }
          const button = createComponent(message.id);
          await interaction.reply({ content: `Embed sent to <#${channel.id}>`, components: [button], ephemeral: true });
          return;
        }

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
          message = await channel.send({ content: `📢 Announcement ${mention}`, embeds: embeds });
          await interaction.reply({
            content: `Embed sent to <#${channel.id}>`,
            components: [createComponent(message.id)],
            ephemeral: true,
          });
          return;
        }
        message = await channel.send({ embeds: embeds });
        await interaction.reply({
          content: `Embed sent to <#${channel.id}>`,
          components: [createComponent(message.id)],
          ephemeral: true,
        });
      } else if (action === "echo") {
        if (mention !== "none") {
          message = await channel.send({ content: `📢 Announcement ${mention}\n# ${title}\n${description}` });
          await interaction.reply({
            content: `Message sent to <#${channel.id}>`,
            components: [createComponent(message.id)],
            ephemeral: true,
          });
          return;
        }

        message = await channel.send({ content: `# ${title}\n${description}` });
        await interaction.reply({
          content: `Message sent to <#${channel.id}>`,
          components: [createComponent(message.id)],
          ephemeral: true,
        });
      } else if (action === "edit") {
        if (!messageId || !channelId || !type) {
          await interaction.reply({ content: "Invalid data received", ephemeral: true });
          return;
        }
        const channel = await interaction.client.channels.fetch(channelId);
        if (!channel) return;
        // @ts-expect-error
        message = await channel.messages.fetch(messageId);
        if (type === "announce") {
          const images = (interaction.fields.getTextInputValue("image") || "")
            .split("\n")
            .filter(url => isValidImageUrl(url));
          const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(COLOR.WHITE as ColorResolvable)
            .setTimestamp()
            .setFooter({ text: FOOTER_VALUE })
            .setImage(images.shift() || null);
          await message.edit({
            embeds: [
              embed,
              ...images.map(image => {
                return new EmbedBuilder().setImage(image).setColor(COLOR.WHITE as ColorResolvable);
              }),
            ],
          });
        } else {
          await message.edit({ content: `📢 Announcement ${mention}\n# ${title}\n${description}` });
        }
        await interaction.reply({ content: "Edited message", ephemeral: true });
      }
    }
  },
};
