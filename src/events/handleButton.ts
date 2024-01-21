import { Events, Interaction, EmbedBuilder, ColorResolvable, ChannelType } from "discord.js";
import db from "../utils/database";
import { ObjectId } from "mongodb";
import { COLOR, FOOTER_VALUE } from "../config/constant";
export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (interaction.isButton()) {
      if (!interaction.guild) return;
      const [button, templateId, channelId] = interaction.customId.split("-");
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
      if (button === "announce") {
        const embed = new EmbedBuilder()
          .setTitle(title)
          .setDescription(description)
          .setColor(COLOR.WHITE as ColorResolvable)
          .setTimestamp()
          .setFooter({ text: FOOTER_VALUE });
        await channel.send({ content: "📢 Announcement", embeds: [embed] });
        await interaction.reply({ content: `Embed sent to <#${channel.id}>` });
      } else if (button === "echo") {
        await channel.send({ content: `📢 Announcement\n# ${title}\n${description}` });
        await interaction.reply({ content: `Message sent to <#${channel.id}>` });
      } else {
        await interaction.reply({ content: "Cancelled Successfully", ephemeral: true });
      }
    }
  },
};
