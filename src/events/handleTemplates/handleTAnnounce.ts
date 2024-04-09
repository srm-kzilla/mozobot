import {
  ChannelType,
  Collection,
  ColorResolvable,
  Colors,
  EmbedBuilder,
  Events,
  Interaction,
  PermissionFlagsBits,
} from "discord.js";
import { ObjectId } from "mongodb";
import { COLOR, FOOTER_VALUE } from "../../config/constant";
import db from "../../utils/database";

export const msgCollection: Collection<string, string> = new Collection();

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.guild) return;
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      await interaction.reply({ content: "You don't have permission to run this command", ephemeral: true });
      return;
    }
    const [button, templateId, channelId] = interaction.customId.split("-");
    if (button !== "announce") return;
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
    await interaction.deferReply();

    const template = await (await db())
      .collection("templates")
      .findOne({ _id: new ObjectId(templateId), isDeleted: false });
    if (!template) {
      interaction.editReply("Not able to find the template from the database");
      return;
    }
    const title = template.title;
    const description = template.description;
    const images = template.images;

    const embeds: EmbedBuilder[] = [];
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(Colors.White)
      .setTimestamp()
      .setFooter({ text: FOOTER_VALUE });

    if (!images) {
      await channel.send({ content: "📢 Announcement - <@&1221428016266219714>", embeds: [embed] });
      await interaction.editReply({ content: `Embeds sent to <#${channel.id}>` });
      return;
    }

    // TODO: check if this condition works else refer the previous and revert
    if (images.length < 0) {
      await channel.send({ content: "📢 Announcement - <@&1221428016266219714>", embeds: [embed] });
      await interaction.editReply({ content: `Embeds sent to <#${channel.id}>` });
      return;
    }

    const firstImage = images.shift();

    if (firstImage) {
      embed.setImage(firstImage);
    }

    embeds.push(embed);

    images.forEach((url: string) => {
      const newEmbed = new EmbedBuilder().setImage(url).setColor(Colors.White);
      embeds.push(newEmbed);
    });
    await channel.send({ content: "📢 Announcement - <@&1221428016266219714>", embeds: embeds });
    await interaction.editReply({ content: `Embeds sent to <#${channel.id}>` });
  },
};
