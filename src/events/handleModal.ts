import { ChannelType, ColorResolvable, EmbedBuilder, Events, Interaction } from 'discord.js';
import { COLOR } from '../config/constant';
import db from '../utils/database';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.guild) return;
    const Title = interaction.fields.getTextInputValue('Title');
    const Description = interaction.fields.getTextInputValue('Description');

    const [cmd, channelID] = interaction.customId.split('-');

    if (cmd === 'template') {
      const collection = (await db()).collection('templates');
      await collection.insertOne({ Title: Title, Description: Description });
      await interaction.reply({ content: 'Template added to database!' });
    } else {
      if (!cmd || !channelID) return;

      const channel = interaction.guild.channels.cache.get(channelID);

      if (!channel) {
        await interaction.reply({ content: 'Target Channel Not Found', ephemeral: true });
        return;
      }

      if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
        await interaction.reply({ content: 'Invalid Channel Provided. Please Provide a text channel' });
        return;
      }

      if (cmd === 'announce') {
        const embed = new EmbedBuilder()
          .setTitle(Title)
          .setDescription(Description)
          .setColor(COLOR.WHITE as ColorResolvable);

        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: `Announcement sent to <#${channel.id}>` });
      } else if (cmd === 'echo') {
        await channel.send({ content: `# ${Title}\n${Description}` });
        await interaction.reply({ content: `Announcement sent to <#${channel.id}>` });
      }
    }
  },
};
