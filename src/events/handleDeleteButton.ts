import { ChannelType, Events, type GuildMemberRoleManager, type Interaction, type Message } from "discord.js";
import config from "../config";

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
    const [button, , channelId, messageId] = interaction.customId.split("-");
    let message: Message;
    if (button !== "delete") return;
    await interaction.deferReply({ ephemeral: true });
    if (!messageId || !channelId) {
      await interaction.editReply({ content: "Invalid data received" });
      return;
    }

    const channel = interaction.guild.channels.cache.get(channelId);
    if (!channel) return;
    if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
      return;
    }

    try {
      message = await channel.messages.fetch(messageId);

      if (!message) {
        await interaction.editReply({ content: "Message not found" });
      } else {
        await message.delete();
        await interaction.editReply({ content: "Deleted Successfully" });
      }
    } catch {
      await interaction.editReply({ content: "Unable to Delete." });
    }
    try {
      await interaction.message.edit({
        content: "Message has been deleted",
        components: [],
      });
    } catch (err) {
      console.log(err);
    }
  },
};
