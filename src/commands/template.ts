import {
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { Command } from '../interface';
import db from '../utils/database';
export default {
  data: new SlashCommandBuilder()
    .setName('template')
    .setDescription('provides us with the templates')
    .setDMPermission(false)
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
      subcommand.setName('create').setDescription('Creates Templates'),
    )
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
      subcommand.setName('list').setDescription('Provides us with the list'),
    )
    .addSubcommand((subcommand: SlashCommandSubcommandBuilder) =>
      subcommand.setName('delete').setDescription('Deletes the Templates'),
    ) as SlashCommandBuilder,

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'create') {
      const modal = new ModalBuilder().setCustomId(`template`).setTitle('Add Template');
      const Title = new TextInputBuilder()
        .setCustomId('Title')
        .setLabel('Provide us with the Title')
        .setStyle(TextInputStyle.Short);
      const Description = new TextInputBuilder()
        .setCustomId('Description')
        .setLabel('Provide us with some Description')
        .setStyle(TextInputStyle.Paragraph);
      const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(Title);
      const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(Description);
      modal.addComponents(firstActionRow, secondActionRow);
      await interaction.showModal(modal);
    } else if (subcommand === 'delete') {
      const data = await (await db()).collection('templates').find().toArray();
      const templatesData = data.map(data => ({
        label: data.Title,
        description: data.Description.slice,
        value: JSON.stringify(data),
      }));
      console.log(templatesData);
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`deleteTemplate`)
        .setPlaceholder('Select a template to delete')
        .addOptions(templatesData);

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
      await interaction.reply({ content: 'Select a template to delete:', components: [actionRow], ephemeral: true });
    } else if (subcommand === 'list') {
      const data = await (await db()).collection('templates').find().toArray();
      const templatesData = data.map(data => ({
        label: data.Title,
        description: data.Description,
        value: data._id.toString(),
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`chooseTemplate`)
        .setPlaceholder('Select a template')
        .addOptions(templatesData);
      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
      await interaction.reply({ content: 'Select a template', components: [actionRow], ephemeral: true });
    }
  },
} as Command;
