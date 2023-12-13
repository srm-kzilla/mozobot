import { SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interface/command';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!').setDMPermission(false),

  async execute(interaction) {
    await interaction.reply('Pong!');
  },
} as ICommand;
