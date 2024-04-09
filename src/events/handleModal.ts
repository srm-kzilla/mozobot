import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Colors,
  EmbedBuilder,
  Events,
  Interaction,
  Message,
} from "discord.js";
import { z } from "zod";
import { FOOTER_VALUE } from "../config/constant";
import isValidImageUrl from "../utils/misc";
const isValidUrl = (url: string): boolean => z.string().url().safeParse(url).success;

// TODO: Make this File more readable
export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.guild) return;
    if (!interaction.isModalSubmit()) return;
    const [action, channelId, mention, messageId, type] = interaction.customId.split("-");
    let message: Message;
    if (!action || !channelId) return;
    if (action !== "announce" && action !== "echo" && action !== "images" && action !== "edit") return;

    const channel = interaction.guild.channels.cache.get(channelId);

    if (!channel) {
      await interaction.reply({ content: "Target Channel Not Found", ephemeral: false });
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
      const title = interaction.fields.getTextInputValue("title");
      const description = interaction.fields.getTextInputValue("description") || " ";
      const image = interaction.fields.getTextInputValue("image") || "none";
      const images = image.split("\n");
      const validUrl = images.filter(url => isValidUrl(url));
      const validImages = validUrl.filter(url => isValidImageUrl(url));

      const embeds: EmbedBuilder[] = [];
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(Colors.White)
        .setTimestamp()
        .setFooter({ text: FOOTER_VALUE });

      if (image === "none") {
        if (mention === "none") {
          message = await channel.send({ content: `📢 Announcement`, embeds: [embed] });
        } else {
          message = await channel.send({ content: `📢 Announcement ${mention}`, embeds: [embed] });
        }
        const button = createComponent(message.id);
        await interaction.reply({
          content: `Embed sent to <#${channel.id}>`,
          components: [button],
          ephemeral: false,
        });
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
        const newEmbed = new EmbedBuilder().setImage(url).setColor(Colors.White);
        embeds.push(newEmbed);
      });
      if (mention !== "none") {
        message = await channel.send({ content: `📢 Announcement ${mention}`, embeds: embeds });

        await interaction.reply({
          content: `Embed sent to <#${channel.id}>`,
          components: [createComponent(message.id)],
          ephemeral: true,
          fetchReply: true,
        });
        return;
      }
      message = await channel.send({ content: `📢 Announcement`, embeds: embeds });

      await interaction.reply({
        content: `Embed sent to <#${channel.id}>`,
        components: [createComponent(message.id)],
        ephemeral: true,
        fetchReply: true,
      });
    } else if (action === "echo") {
      const title = interaction.fields.getTextInputValue("title");
      const description = interaction.fields.getTextInputValue("description") || " ";
      if (mention !== "none") {
        message = await channel.send({ content: `📢 Announcement ${mention}\n# ${title}\n${description}` });

        await interaction.reply({
          content: `Message sent to <#${channel.id}>`,
          components: [createComponent(message.id)],
          ephemeral: false,
          fetchReply: true,
        });
        return;
      }

      message = await channel.send({ content: `# ${title}\n${description}` });

      await interaction.reply({
        content: `Message sent to <#${channel.id}>`,
        components: [createComponent(message.id)],
        ephemeral: false,
        fetchReply: true,
      });
    } else if (action === "images") {
      const image = interaction.fields.getTextInputValue("image") || "none";
      const images = image.split("\n");
      const imageUrls = images.filter(url => isValidUrl(url));
      const validImages = imageUrls.filter(url => isValidImageUrl(url));
      if (validImages.length > 0) {
        for (const imageUrl of validImages) {
          await channel.send({ content: imageUrl });
        }
        await interaction.reply({ content: "Image sent successfully", ephemeral: false });
      } else {
        await interaction.reply({ content: "Invalid Image", ephemeral: false });
      }
    } else if (action === "edit") {
      const title = interaction.fields.getTextInputValue("title") || null;
      const description = interaction.fields.getTextInputValue("description") || null;
      if (!messageId || !channelId || !type) {
        await interaction.reply({ content: "Invalid data received", ephemeral: false });
        return;
      }

      if (!title && !description) {
        await interaction.reply({ content: "Both Title and Description can't be empty", ephemeral: false });
        return;
      }

      const channel = await interaction.client.channels.fetch(channelId);
      if (!channel) return;
      // @ts-expect-error: type issue with discord.js
      message = await channel.messages.fetch(messageId);
      if (type === "announce") {
        const images = (interaction.fields.getTextInputValue("image") || "").split("\n").filter(url => isValidUrl(url));
        const imageUrl = images.filter(url => isValidImageUrl(url));
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(Colors.White)
          .setTimestamp()
          .setFooter({ text: FOOTER_VALUE })
          .setImage(imageUrl.shift() || null);
        await message.edit({
          embeds: [
            embed,
            ...imageUrl.map(image => {
              return new EmbedBuilder().setImage(image).setColor(Colors.White);
            }),
          ],
        });
      } else {
        await message.edit({ content: `📢 Announcement ${mention}\n# ${title}\n${description}` });
      }
      await interaction.reply({ content: "Edited message", ephemeral: false, components: [] });
    }
  },
};
