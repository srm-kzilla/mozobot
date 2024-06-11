import { Events, type Interaction, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";

export default {
  name: Events.InteractionCreate,
  once: false,

  async execute(interaction: Interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== "chooseTemplate") return;
    if (!interaction.values[0]) {
      console.log("Invalid value given");
      await interaction.reply({
        content: "you are facing an error :/",
        ephemeral: true,
      });
      return;
    }

    const [templateId, channelId, roleId] = interaction.values[0].split("-");
    const announce = new ButtonBuilder()
      .setCustomId(`announce-${templateId}-${channelId}-${roleId}`)
      .setLabel("Announce")
      .setStyle(ButtonStyle.Primary);
    const echo = new ButtonBuilder()
      .setCustomId(`echo-${templateId}-${channelId}-${roleId}`)
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
