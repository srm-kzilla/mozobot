// TODO: TEST THIS!!
import { ChatInputCommandInteraction } from 'discord.js';
import { CommandInterface } from '../internal/interface/command';

// export const data = new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!");

// export const execute = async (interaction: any) => {
//     await interaction.reply("Pong!");
// };

export default class PingCommand implements CommandInterface {
  name: string;
  description: string;
  testOnly?: boolean;

  constructor() {
    this.name = 'ping';
    this.description = 'Replies with Pong!';
    this.testOnly = true;
  }

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply('Pong!');
  }
}
