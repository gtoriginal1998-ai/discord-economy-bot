const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Show your collected inventory items.'),
  async execute(client, interaction) {
    const inventory = client.db.getInventory(interaction.guildId, interaction.user.id);
    if (!inventory.length) {
      return interaction.reply({ content: 'Your inventory is empty. Earn loot packs or spin the wheel to collect items!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.user.username}'s Inventory`)
      .setColor('#5DADEC')
      .setDescription(inventory.map((entry) => `**${entry.item}** — ${entry.quantity}`).join('\n'));

    await interaction.reply({ embeds: [embed] });
  }
};
