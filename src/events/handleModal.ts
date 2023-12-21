import { ChannelType, ColorResolvable, EmbedBuilder, Events, Interaction } from 'discord.js';
import { COLOR } from '../config/constant';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.guild) return;
    const [cmd, channelID] = interaction.customId.split('-');
    if (!cmd || !channelID) return;

    const channel = interaction.guild.channels.cache.get(channelID);

    if (!channel) {
      return await interaction.reply({ content: 'Target Channel Not Found', ephemeral: true });
    }

    if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
      return await interaction.reply({ content: 'Inavlid Channel Provided. Please Provide a text channel' });
    }

    const Title = interaction.fields.getTextInputValue('Title');
    const Description = interaction.fields.getTextInputValue('Description');

    if (cmd === 'announce') {
      const embed = new EmbedBuilder()
        .setTitle(Title)
        .setDescription(Description)
        .setColor(COLOR.WHITE as ColorResolvable);

      await channel.send({ embeds: [embed] });
    } else if (cmd === 'echo') {
      await channel.send({ content: `# ${Title}\n${Description}` });
    }
    await interaction.reply({ content: `Announcement sent to <#${channel.id}>` });
  },
};
