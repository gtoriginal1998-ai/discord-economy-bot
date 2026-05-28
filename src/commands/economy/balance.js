const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Show your economy balance and tickets.'),
  async execute(client, interaction) {
    const user = client.db.getUser(interaction.guildId, interaction.user.id);
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Wallet`)
      .setColor('#57F287')
      .addFields(
        { name: 'Tickets', value: `${user.tickets}`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
