import { SlashCommandBuilder } from 'discord.js';
import { CommandInterface } from '../interface';

export default {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!').setDMPermission(false),

  async execute(interaction) {
    const message = await interaction.reply({ content: 'Pong!', fetchReply: true });
    await interaction.editReply(`Pong! Latency is ${Math.abs(Date.now() - message.createdTimestamp)}ms.`);
  },
} as CommandInterface;
