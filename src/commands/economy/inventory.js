const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getItemByName, getItemRarity } = require('../../utils/rustItems');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Show your collected inventory items.'),
  async execute(client, interaction) {
    const inventory = client.db.getInventory(interaction.guildId, interaction.user.id);
    if (!inventory.length) {
      return interaction.reply({ content: 'Your inventory is empty. Earn loot packs or spin the wheel to collect items!', ephemeral: true });
    }

    const rarityColors = {
      common: '#95A5A6',
      uncommon: '#2ECC71',
      rare: '#3498DB',
      epic: '#9B59B6',
      legendary: '#F39C12'
    };

    const inventoryLines = inventory
      .map((entry) => {
        const itemData = getItemByName(entry.item);
        const rarity = getItemRarity(entry.item);
        return `${itemData?.emoji || '📦'} **${entry.item}** ×${entry.quantity} (${rarity})`;
      })
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`📦 ${interaction.user.username}'s Inventory`)
      .setColor('#5DADEC')
      .setDescription(inventoryLines);

    await interaction.reply({ embeds: [embed] });
  }
};
