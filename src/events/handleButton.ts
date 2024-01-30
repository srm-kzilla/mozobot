import {
  Events,
  Interaction,
  EmbedBuilder,
  ColorResolvable,
  ChannelType,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalBuilder,
} from "discord.js";
import db from "../utils/database";
import { ObjectId } from "mongodb";
import { COLOR, FOOTER_VALUE } from "../config/constant";

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (interaction.isButton()) {
      if (!interaction.guild) return;
      const [button, templateId, channelId, messageId, action] = interaction.customId.split("-");
      if (button === "announce" || button === "echo") {
        if (!templateId || !channelId) {
          await interaction.reply({ content: "Invalid ChannelId", ephemeral: true });
          return;
        }
        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) {
          await interaction.reply({ content: "Target Channel Not Found", ephemeral: true });
          return;
        }

        if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
          await interaction.reply({ content: "Invalid Channel Provided. Please Provide a text channel" });
          return;
        }
        const template = await (await db())
          .collection("templates")
          .findOne({ _id: new ObjectId(templateId), isDeleted: false });
        if (!template) {
          return;
        }
        const title = template.title;
        const description = template.description;
        const images = template.images;

        if (button === "announce") {
          const embeds: EmbedBuilder[] = [];
          const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(COLOR.WHITE as ColorResolvable)
            .setTimestamp()
            .setFooter({ text: FOOTER_VALUE });
          if (!images) {
            await channel.send({ content: "📢 Announcement", embeds: [embed] });
            await interaction.reply({ content: `Embeds sent to <#${channel.id}>` });
            return;
          }
          if (images.length > 0) {
            const firstImage = images.shift();

            if (firstImage) {
              embed.setImage(firstImage);
            }

            embeds.push(embed);

            images.forEach((url: string) => {
              const newEmbed = new EmbedBuilder().setImage(url).setColor(COLOR.WHITE as ColorResolvable);
              embeds.push(newEmbed);
            });
          } else {
            await channel.send({ content: "📢 Announcement", embeds: [embed] });
            await interaction.reply({ content: `Embeds sent to <#${channel.id}>` });
          }
          await channel.send({ content: "📢 Announcement", embeds: embeds });
          await interaction.reply({ content: `Embeds sent to <#${channel.id}>` });
        } else if (button === "echo") {
          await channel.send({ content: `📢 Announcement\n# ${title}\n${description}` });
          await interaction.reply({ content: `Message sent to <#${channel.id}>` });
        }
      } else if (button === "edit") {
        const Title = new TextInputBuilder()
          .setCustomId("Title")
          .setLabel("Provide us with the Title")
          .setStyle(TextInputStyle.Short)
          .setMaxLength(50);
        const Description = new TextInputBuilder()
          .setCustomId("Description")
          .setLabel("Provide us with some Description")
          .setStyle(TextInputStyle.Paragraph)
          .setMaxLength(1900);
        const Image = new TextInputBuilder()
          .setCustomId("image")
          .setLabel("Provide us with the Image")
          .setStyle(TextInputStyle.Paragraph)
          .setMinLength(10)
          .setMaxLength(4000)
          .setRequired(false);

        const modal = new ModalBuilder()
          .setCustomId(`edit-${channelId}--${messageId}-${action}`)
          .setTitle("Announcements");
        const actionRows = [
          new ActionRowBuilder<TextInputBuilder>().addComponents(Title),
          new ActionRowBuilder<TextInputBuilder>().addComponents(Description),
          new ActionRowBuilder<TextInputBuilder>().addComponents(Image),
        ];
        modal.addComponents(...actionRows.slice(0, action === "announce" ? 3 : 2));
        await interaction.showModal(modal);
      } else if (button === "delete") {
        if (!messageId || !channelId) {
          await interaction.reply({ content: "Invalid data received", ephemeral: true });
          return;
        }
        const channel = await interaction.client.channels.fetch(channelId);
        if (!channel) return;
        // @ts-ignore
        const message = await channel.messages.fetch(messageId);
        await message.delete();
        await interaction.reply({ content: "Deleted Successfully", ephemeral: true });
      }
    }
  },
};
