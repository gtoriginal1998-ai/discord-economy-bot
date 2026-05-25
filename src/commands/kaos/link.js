const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your Discord account to your Rust console Steam ID.')
    .addStringOption((option) => option.setName('steamid').setDescription('Your Steam ID3 (e.g., 110000100000000)').setRequired(true)),
  async execute(client, interaction) {
    const steamId = interaction.options.getString('steamid').trim();

    // Validate Steam ID format (roughly)
    if (!/^\d+$/.test(steamId) || steamId.length < 10) {
      return interaction.reply({
        content: '❌ Invalid Steam ID format. Use your Steam ID3 (numbers only, 10+ digits).',
        ephemeral: true
      });
    }

    // Check if already linked
    const existing = client.db.getLinkedAccount(interaction.guildId, interaction.user.id);
    if (existing) {
      return interaction.reply({
        content: `✅ You're already linked to **${existing.steamId}**.\nUse \`/unlink\` to remove it first.`,
        ephemeral: true
      });
    }

    client.db.linkAccount(interaction.guildId, interaction.user.id, steamId);

    const embed = new EmbedBuilder()
      .setTitle('✅ Account Linked')
      .setDescription(`Your Discord is now linked to Steam ID **${steamId}**.\n\nYou can now claim rewards directly to your in-game inventory using \`/claim\`.`)
      .setColor('#2ECC71')
      .setFooter({ text: 'Your steam ID is securely stored on our server.' });

    await interaction.reply({ embeds: [embed] });
  }
};
