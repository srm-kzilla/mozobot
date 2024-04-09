import { Events, Interaction, ChannelType, PermissionFlagsBits, Collection } from "discord.js";

export const msgCollection: Collection<string, string> = new Collection();

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (interaction.isButton()) {
      if (!interaction.guild) return;
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
        await interaction.reply({ content: "You don't have permission to run this command", ephemeral: true });
        return;
      }
      const [button, _templateId, channelId, messageId] = interaction.customId.split("-");

      if (button !== "delete") return;
      await interaction.deferReply({ ephemeral: true });
      if (!messageId || !channelId) {
        await interaction.editReply({ content: "Invalid data received" });
        return;
      }
      const tMsgInfo = msgCollection.get(`${channelId}-${messageId}`);
      if (!tMsgInfo) {
        interaction.editReply({ content: "Not able to fetch message. Please Delete Manually." });
        return;
      }

      const channel = interaction.guild.channels.cache.get(channelId);
      if (!channel) return;
      if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
        return;
      }
      const [tMessageId, tChannelId] = tMsgInfo.split("-");
      if (!tMessageId || !tChannelId) return;

      const message = await channel.messages.fetch(messageId);
      if (!message) {
        await interaction.editReply({ content: "Not able to fetch message. Please Delete Manually." });
      } else {
        await message.delete();
        await interaction.editReply({ content: "Deleted Successfully" });
      }

      const tchannel = interaction.guild.channels.cache.get(tChannelId);
      if (!tchannel) return;

      if (tchannel.type !== ChannelType.GuildText && tchannel.type !== ChannelType.GuildAnnouncement) {
        return;
      }

      const tmsg = await tchannel.messages.fetch(tMessageId);
      if (!tmsg) return;

      if (!message) {
        await tmsg.edit({ content: "Failed Attempt to delete message.", components: [] });
      } else {
        await tmsg.edit({ content: "Message has been deleted.", components: [] });
        return;
      }
    }
  },
};
