// TODO: TEST THIS!!
import { ChatInputCommandInteraction } from 'discord.js';
import { CommandInterface } from '../internal/interface/command';
import { DiscordClient } from '../internal/discordClient';

// TODO: Is there a better way to do this? Find it out
export default class PingCommand implements CommandInterface {
  client: DiscordClient;

  name: string;
  description: string;
  guildOnly: boolean;
  testOnly: boolean;
  category: string;
  options: Object[];

  constructor(client: DiscordClient) {
    this.client = client;
    this.name = 'ping';
    this.category = 'general';
    this.description = 'Replies with Pong!';
    this.guildOnly = true;
    this.testOnly = true;
    this.options = [];
  }

  async execute(interaction: ChatInputCommandInteraction, ...args: any): Promise<void> {
    const ping = await interaction.reply({ content: 'Pong!', fetchReply: true });
    await interaction.editReply(`Pong! Latency is ${ping.createdTimestamp - interaction.createdTimestamp}ms.`);
  }
}
