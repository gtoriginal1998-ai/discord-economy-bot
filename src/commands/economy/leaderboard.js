const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show the top economy users in this server.'),
  async execute(client, interaction) {
    const rows = client.db.db
      .prepare('SELECT userId, balance, xp, level FROM users WHERE guildId = ? ORDER BY balance DESC LIMIT 10')
      .all(interaction.guildId);

    if (!rows.length) {
      return interaction.reply({ content: 'No leaderboard data yet. Use economy commands to earn coins.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('Economy Leaderboard')
      .setColor('#E91E63')
      .setDescription(rows.map((row, index) => `**${index + 1}.** <@${row.userId}> — ${row.balance} coins, Level ${row.level}`).join('\n'));

    await interaction.reply({ embeds: [embed] });
  }
};
