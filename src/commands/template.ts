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
import { templateSchemaType } from '../types';
import { ObjectId } from 'mongodb';
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
    if (!interaction.guild) return;
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
      const data = await (await db())
        .collection('templates')
        .find({ guildId: interaction.guildId, isDeleted: false })
        .toArray();

      // !data
      if (data.length === 0) {
        await interaction.reply({
          content: 'No Templates found! use `/template create` to create one!',
          ephemeral: true,
        });
      }

      const templatesData = data.map(data => ({
        label: data.title.slice(0, 50),
        description: data.description.slice(0, 50),
        value: data._id.toString(),
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`deleteTemplate`)
        .setPlaceholder('Select a template to delete')
        .addOptions(templatesData);

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
      await interaction.reply({ content: 'Select a template to delete:', components: [actionRow], ephemeral: true });
    } else if (subcommand === 'list') {
      let data = await (
        await db()
      )
        .collection('templates')
        .find({
          guildId: interaction.guildId,
          isDeleted: false,
        })
        .toArray();

      if (data.length === 0) {
        await interaction.reply({
          content: 'No Templates found! use `/template create` to create one!',
          ephemeral: true,
        });
      }

      const templatesData = data.map(data => ({
        label: data.title.slice(0, 50),
        description: data.description.slice(0, 50),
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
