import {
  ActionRowBuilder,
  ChannelType,
  ModalBuilder,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { Command } from "../interface";
import db from "../utils/database";
import { ObjectId } from "mongodb";
import { TemplateSchemaType } from "../types";

export default {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Announce a message to a channel")
    .setDMPermission(false)
    .addChannelOption((option: SlashCommandChannelOption) => {
      return option
        .setName("channel")
        .setDescription("Channel to announce to")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
    })
    .addStringOption(option => option.setName("id").setDescription("The template you want to use").setRequired(false))
    .addStringOption(option =>
      option.setName("mention").setDescription("Who to mention").setRequired(false),
    ) as SlashCommandBuilder,

  async execute(interaction) {
    if (!interaction.guild) return;
    const channelId = (interaction.options.getChannel("channel")?.id || interaction.channelId) as string;
    const templateId = interaction.options.getString("id");
    const mention = interaction.options.getString("mention") || "none";
    if (templateId) {
      const data = await (await db())
        .collection<TemplateSchemaType>("templates")
        .findOne({ _id: new ObjectId(templateId), isDeleted: false });

      if (!data) {
        await interaction.reply({ content: "Did not find a template with that ID", ephemeral: true });
        return;
      }
      const channel = interaction.guild.channels.cache.get(channelId);

      if (!channel) {
        await interaction.reply({ content: "Target Channel Not Found", ephemeral: true });
        return;
      }

      if (channel.type !== ChannelType.GuildText && channel.type !== ChannelType.GuildAnnouncement) {
        await interaction.reply({ content: "Invalid Channel Provided. Please Provide a text channel" });
        return;
      }

      if (mention !== "none") {
        await channel.send({ content: `📢 Announcement ${mention}\n# ${data.title}\n${data.description}` });
        await interaction.reply({ content: `Message sent to <#${channel.id}>` });
        return;
      }

      await channel.send({ content: `# ${data.title}\n${data.description}` });
      await interaction.reply({ content: `Message sent to <#${channel.id}>` });
      return;
    }
    const Title = new TextInputBuilder()
      .setCustomId("Title")
      .setLabel("Provide us with the Title")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(50);
    const Description = new TextInputBuilder()
      .setCustomId("Description")
      .setLabel("Provide us with some Description")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(1900);

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(Title);
    const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(Description);
    const modal = new ModalBuilder().setCustomId(`echo-${channelId}-${mention}`).setTitle("Echo Modal");
    modal.addComponents(firstActionRow, secondActionRow);
    await interaction.showModal(modal);
  },
} as Command;
