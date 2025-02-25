import {
  ChannelType,
  Colors,
  EmbedBuilder,
  Events,
  roleMention,
  type GuildMemberRoleManager,
  type Interaction,
} from "discord.js";
import { ObjectId } from "mongodb";
import config from "../../config";
import { FOOTER_VALUE } from "../../config/constant";
import db from "../../utils/database";

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.guild) return;
    if (!(interaction.member?.roles as GuildMemberRoleManager).resolve(config.MOD_ROLE_ID)) {
      await interaction.reply({
        content: "You do not have the required roles to execute this action.",
        ephemeral: true,
      });
      return;
    }
    const [button, templateId, channelId, roleId] = interaction.customId.split("-");
    if (button !== "announce") return;
    if (!templateId || !channelId || !roleId) {
      await interaction.reply({
        content: "Invalid ChannelId",
        ephemeral: true,
      });
      return;
    }
    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) {
      await interaction.reply({
        content: "Target Channel Not Found",
        ephemeral: true,
      });
      return;
    }

    if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
      await interaction.reply({
        content: "Invalid Channel Provided. Please Provide a text channel",
      });
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

    const isEeveryone = interaction.guild.roles.everyone.id === roleId;
    const mention = isEeveryone ? "@everyone" : roleMention(roleId);
    const embed_title = `📢 Announcement ${roleId === "none" ? "" : `- ${mention}`}`;

    if (!images) {
      await channel.send({ content: embed_title, embeds: [embed] });
      await interaction.editReply({
        content: `Embeds sent to <#${channel.id}>`,
      });
      return;
    }

    if (images.length < 0) {
      await channel.send({ content: embed_title, embeds: [embed] });
      await interaction.editReply({
        content: `Embeds sent to <#${channel.id}>`,
      });
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

    await channel.send({ content: embed_title, embeds: embeds });
    await interaction.editReply({ content: `Embeds sent to <#${channel.id}>` });
  },
};
