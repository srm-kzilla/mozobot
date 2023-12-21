import {
  ActionRowBuilder,
  ChannelType,
  ModalBuilder,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { Command } from '../interface';

export default {
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Display the input entered in the Modal')
    .setDMPermission(false)
    .addChannelOption((option: SlashCommandChannelOption) => {
      return option
        .setName('channel')
        .setDescription('Channel to announce to')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
    }) as SlashCommandBuilder,

  async execute(interaction) {
    const channelID = (interaction.options.getChannel('channel')?.id || interaction.channelId) as string;
    const modal = new ModalBuilder().setCustomId(echo-${channelID}).setTitle('My Modal');
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
