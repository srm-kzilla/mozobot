import { ChannelType, Collection, Events, GuildMemberRoleManager, Interaction } from "discord.js";
import { ObjectId } from "mongodb";
import db from "../../utils/database";
import config from "../../config";

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

    const [button, templateId, channelId] = interaction.customId.split("-");
    if (button !== "echo") return;
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

    // TODO: Remove the static role mention and implement dynamic role input
    await channel.send({ content: `📢 Announcement - <@&1221428016266219714>\n# ${title}\n${description}` });
    await interaction.editReply({ content: `Message sent to <#${channel.id}>` });
  },
};
