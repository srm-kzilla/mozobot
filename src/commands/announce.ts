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
    .setName("announce")
    .setDescription("announcement the world something")
    .setDMPermission(false)
    .addChannelOption((option: SlashCommandChannelOption) => {
      return option
        .setName("channel")
        .setDescription("Channel to announce to")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
    })
    .addRoleOption(option =>
      option.setName("mention").setDescription("Who to mention").setRequired(false),
    ) as SlashCommandBuilder,

  async execute(interaction) {
    if (!interaction.guild) return;

    const channelId = (interaction.options.getChannel("channel")?.id || interaction.channelId) as string;
    const mention = interaction.options.getRole("mention") || "none";

    const modal = new ModalBuilder().setCustomId(`announce-${channelId}-${mention}`).setTitle("Announcements");
    const Title = new TextInputBuilder()
      .setCustomId("title")
      .setLabel("Provide us with the Title")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(50);
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

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(Title);
    const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(Description);
    const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(Image);
    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);
    await interaction.showModal(modal);
  },
} as Command;
