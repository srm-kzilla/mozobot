import { SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../interface/command';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!').setDMPermission(false),

  async execute(interaction) {
    const message = interaction.reply({ content: 'Pong!', fetchReply: true });
    interaction.editReply(`Pong! Latency is ${Math.abs(Date.now() - (await message).createdTimestamp)}ms.`);
  },
} as ICommand;
