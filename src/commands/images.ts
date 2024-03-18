import {
  ActionRowBuilder,
  ChannelType,
  ModalBuilder,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Command } from "../interface";

export default {
  data: new SlashCommandBuilder()
    .setName("images")
    .setDescription("send images")
    .setDMPermission(false)
    .addChannelOption((option: SlashCommandChannelOption) => {
      return option
        .setName("channel")
        .setDescription("Channel to announce to")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
    }) as SlashCommandBuilder,

  isMod: true,

  async execute(interaction) {
    if (!interaction.guild) return;
    const channelId = (interaction.options.getChannel("channel")?.id || interaction.channelId) as string;
    const modal = new ModalBuilder().setCustomId(`images-${channelId}`).setTitle("Images");
    const Image = new TextInputBuilder()
      .setCustomId("image")
      .setLabel("Provide us with the Image")
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(10)
      .setMaxLength(4000);

    const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(Image);
    modal.addComponents(thirdActionRow);
    await interaction.showModal(modal);
  },
} as Command;
