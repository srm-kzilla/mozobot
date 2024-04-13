import {
  ActionRowBuilder,
  Events,
  GuildMemberRoleManager,
  Interaction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
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
    const [button, , channelId, messageId, action] = interaction.customId.split("-");
    if (button !== "edit") return;
    if (!channelId) {
      await interaction.reply({ content: "Invalid ChannelId", ephemeral: true });
      return;
    }

    const Title = new TextInputBuilder()
      .setCustomId("title")
      .setLabel("Provide us with the Title")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(50)
      .setRequired(false);

    const Description = new TextInputBuilder()
      .setCustomId("description")
      .setLabel("Provide us with some Description")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(1900)
      .setRequired(false);

    const Image = new TextInputBuilder()
      .setCustomId("image")
      .setLabel("Provide us with the Image")
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setMaxLength(4000)
      .setRequired(false);

    const modal = new ModalBuilder().setCustomId(`edit-${channelId}--${messageId}-${action}`).setTitle("Announcements");
    const actionRows = [
      new ActionRowBuilder<TextInputBuilder>().addComponents(Title),
      new ActionRowBuilder<TextInputBuilder>().addComponents(Description),
      new ActionRowBuilder<TextInputBuilder>().addComponents(Image),
    ];
    modal.addComponents(...actionRows.slice(0, action === "announce" ? 3 : 2));
    await interaction.showModal(modal);
  },
};
