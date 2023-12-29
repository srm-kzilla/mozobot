import {
  ActionRowBuilder,
  ChannelType,
  ModalBuilder,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  ColorResolvable,
} from 'discord.js';
import { Command } from '../interface';
import { COLOR } from '../config/constant';
import db from '../utils/database';
import { ObjectId } from 'mongodb';

export default {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('announcement the world something')
    .setDMPermission(false)
    .addChannelOption((option: SlashCommandChannelOption) => {
      return option
        .setName('channel')
        .setDescription('Channel to announce to')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
    })
    .addStringOption(option =>
      option.setName('template-id').setDescription('The template you want to use').setRequired(false),
    ) as SlashCommandBuilder,

  async execute(interaction) {
    if (!interaction.guild) return;

    const channelID = (interaction.options.getChannel('channel')?.id || interaction.channelId) as string;
    const templateID = interaction.options.getString('template-id');

    if (templateID) {
      const data = await (await db()).collection('templates').findOne({ _id: new ObjectId(templateID) });

      if (!data) {
        await interaction.reply({ content: 'Did not find a template with that ID', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(data.Title)
        .setDescription(data.Description)
        .setColor(COLOR.WHITE as ColorResolvable);

      const channel = interaction.guild.channels.cache.get(channelID);

      if (!channel) {
        await interaction.reply({ content: 'Target Channel Not Found', ephemeral: true });
        return;
      }

      if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
        await interaction.reply({ content: 'Invalid Channel Provided. Please Provide a text channel' });
        return;
      }

      await channel.send({ embeds: [embed] });

      await interaction.reply({ content: `Announcement sent to <#${channel.id}>` });
      return;
    }

    const modal = new ModalBuilder().setCustomId(`announce-${channelID}`).setTitle('Announcements');
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
  },
} as Command;
