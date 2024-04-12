import { Events, Interaction, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "chooseTemplate") return;
    const { templateId, channelId } = JSON.parse(interaction.values[0] || "{}");
    const announce = new ButtonBuilder()
      .setCustomId(`announce-${templateId}-${channelId}`)
      .setLabel("Announce")
      .setStyle(ButtonStyle.Primary);
    const echo = new ButtonBuilder()
      .setCustomId(`echo-${templateId}-${channelId}`)
      .setLabel("Echo")
      .setStyle(ButtonStyle.Success);
    const button = new ActionRowBuilder<ButtonBuilder>().addComponents(announce, echo);
    await interaction.reply({
      content: "Which action would you like to perform?",
      components: [button],
      ephemeral: true,
    });
  },
};
