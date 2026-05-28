const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Show your economy balance, XP, level, and tickets.'),
  async execute(client, interaction) {
    const user = client.db.getUser(interaction.guildId, interaction.user.id);
    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Wallet`)
      .setColor('#57F287')
      .addFields(
        { name: 'Tickets', value: `${user.tickets}`, inline: true },
        { name: 'XP', value: `${user.xp}`, inline: true },
        { name: 'Level', value: `${user.level}`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  }
};
