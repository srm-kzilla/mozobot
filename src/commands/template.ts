import {
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  SlashCommandSubcommandBuilder,
  ChannelType,
} from "discord.js";
import { Command } from "../interface";
import db from "../utils/database";

export default {
  data: new SlashCommandBuilder()
    .setName("template")
    .setDescription("provides us with the templates")
    .setDMPermission(false)
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
      subcommand.setName("create").setDescription("Creates Templates"),
    )
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
      subcommand
        .setName("list")
        .setDescription("Provides us with the list")
        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription("Channel to announce to")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        ),
    )
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
      subcommand.setName("delete").setDescription("Deletes the Templates"),
    ) as SlashCommandBuilder,

  async execute(interaction) {
    if (!interaction.guild) return;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
      const modal = new ModalBuilder().setCustomId(`template`).setTitle("Add Template");
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
    } else if (subcommand === "delete") {
      await interaction.deferReply({ ephemeral: true });
      const data = await (await db())
        .collection("templates")
        .find({ guildId: interaction.guildId, isDeleted: false })
        .toArray();

      if (data.length === 0) {
        await interaction.editReply({
          content: "No Templates found! use `/template create` to create one!",
        });
        return;
      }

      const templatesData = data.map(data => ({
        label: data.title.slice(0, 50),
        description: data.description.slice(0, 50),
        value: data._id.toString(),
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`deleteTemplate`)
        .setPlaceholder("Select a template to delete")
        .addOptions(templatesData);

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
      await interaction.editReply({ content: "Select a template to delete:", components: [actionRow] });
    } else if (subcommand === "list") {
      await interaction.deferReply({ ephemeral: true });
      const data = await (
        await db()
      )
        .collection("templates")
        .find({
          guildId: interaction.guildId,
          isDeleted: false,
        })
        .toArray();

      if (data.length === 0) {
        await interaction.reply({
          content: "No Templates found! use `/template create` to create one!",
          ephemeral: true,
        });
        return;
      }
      const channelId = (interaction.options.getChannel("channel")?.id || interaction.channelId) as string;
      const templatesData = data.map(data => ({
        label: data.title.slice(0, 50),
        description: data.description.slice(0, 50),
        value: JSON.stringify({ templateId: data._id.toString(), channelId }),
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`chooseTemplate`)
        .setPlaceholder("Select a template")
        .addOptions(templatesData);
      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
      await interaction.editReply({ content: "Select a template", components: [actionRow] });
    }
  },
} as Command;
