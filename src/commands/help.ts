import { CacheType, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { getCommandData } from "../utils";

export default {
  data: new SlashCommandBuilder().setName("help").setDescription("Get help with using the bot"),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    const commands = getCommandData().map(command => Object(command));
    const embed = new EmbedBuilder().setTitle("Help");
    commands.forEach(command => {
      embed.addFields({
        name: `/${command.name}`,
        value: command.description,
        inline: true,
      });
    });

    await interaction.reply({ embeds: [embed] });
  },
};
