const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('linked')
    .setDescription('Check your linked Rust account.'),
  async execute(client, interaction) {
    const linked = client.db.getLinkedAccount(interaction.guildId, interaction.user.id);

    if (!linked) {
      return interaction.reply({
        content: '❌ You don\'t have a linked account.\nUse `/link <steamid>` to link your Rust console account.',
        ephemeral: true
      });
    }

    // Get pending deliveries count
    const pending = client.db.getPendingDeliveries(interaction.guildId, interaction.user.id);
    const pendingCount = pending.length;

    // Get delivery history
    const history = client.db.getDeliveryHistory(interaction.guildId, interaction.user.id, 5);

    const embed = new EmbedBuilder()
      .setTitle('🔗 Account Link Status')
      .setColor('#3498DB')
      .addFields(
        { name: 'Linked Steam ID', value: `\`${linked.steamId}\``, inline: false },
        { name: 'Pending Rewards', value: pendingCount > 0 ? `${pendingCount} item(s)\nUse \`/claim\` to deliver them.` : 'None', inline: false }
      );

    if (history.length) {
      const historyText = history
        .map((h) => `• **${h.item}** ×${h.quantity} — ${h.status}`)
        .join('\n');
      embed.addFields({ name: 'Recent Deliveries', value: historyText, inline: false });
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
