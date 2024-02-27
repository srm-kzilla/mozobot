import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help with using the bot"),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    
    await interaction.reply("I'm a bot, I can't help you with anything");
    
  },
};