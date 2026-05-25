const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlink')
    .setDescription('Unlink your Rust console account from Discord.'),
  async execute(client, interaction) {
    const linked = client.db.getLinkedAccount(interaction.guildId, interaction.user.id);

    if (!linked) {
      return interaction.reply({
        content: '❌ You don\'t have a linked account. Use `/link` to link your Steam ID.',
        ephemeral: true
      });
    }

    client.db.unlinkAccount(interaction.guildId, interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle('✅ Account Unlinked')
      .setDescription(`Your Discord is no longer linked to **${linked.steamId}**.`)
      .setColor('#E74C3C');

    await interaction.reply({ embeds: [embed] });
  }
};
