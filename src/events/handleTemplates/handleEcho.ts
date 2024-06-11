import { ChannelType, Events,roleMention, type GuildMemberRoleManager, type Interaction } from "discord.js";
import { ObjectId } from "mongodb";
import config from "../../config";
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

    const [button, templateId, channelId,roleId] = interaction.customId.split("-");
    if (button !== "echo") return;
    if (!templateId || !channelId||!roleId) {
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

    const isEeveryone = interaction.guild.roles.everyone.id === roleId;
    const mention = isEeveryone ? "@everyone" : roleMention(roleId);
    const embed_title = `📢 Announcement ${roleId === "none" ? "" : `- ${mention}`}`;

    await channel.send({ content: `${embed_title}\n# ${title}\n${description}` });
    await interaction.editReply({ content: `Message sent to <#${channel.id}>` });
  },
};
