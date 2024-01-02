import { ChannelType, ColorResolvable, EmbedBuilder, Events, Interaction } from 'discord.js';
import { COLOR } from '../config/constant';
import db from '../utils/database';
import { templateSchemaType } from '../types';

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.guild) return;
    if (!interaction.isModalSubmit()) return;
    const title = interaction.fields.getTextInputValue('Title');
    const description = interaction.fields.getTextInputValue('Description');

    const [cmd, channelID] = interaction.customId.split('-');



    if (cmd === 'template') {

      const data = await (await db()).collection('templates').find({guildId: interaction.guildId, isDeleted: false}).toArray();
      if (data.length >= 25) {
        return interaction.reply({content: 'You can only have max 25 templates', ephemeral: true})
      }

      const templateExists = data.some((template) => template.title === title || template.description === description);

      if (templateExists) {
        return interaction.reply({ content: 'Template with the same title and description already exists', ephemeral: true });
      }
      
      await (await db()).collection<templateSchemaType>('templates').insertOne({
        title,
        description,
        guildId: interaction.guild.id,
        isDeleted: false
      });
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
          .setTitle(title)
          .setDescription(description)
          .setColor(COLOR.WHITE as ColorResolvable);

        await channel.send({ embeds: [embed] });
        await interaction.reply({ content: `Announcement sent to <#${channel.id}>` });
      } else if (cmd === 'echo') {
        await channel.send({ content: `# ${title}\n${description}` });
        await interaction.reply({ content: `Announcement sent to <#${channel.id}>` });
      }
    }
  },
};
