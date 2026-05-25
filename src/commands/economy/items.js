const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { RUST_ITEMS, getItemsByRarity } = require('../../utils/rustItems');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('items')
    .setDescription('View available Rust items by rarity.')
    .addStringOption((option) =>
      option
        .setName('rarity')
        .setDescription('Filter by rarity')
        .setRequired(false)
        .addChoices(
          { name: 'Common', value: 'common' },
          { name: 'Uncommon', value: 'uncommon' },
          { name: 'Rare', value: 'rare' },
          { name: 'Epic', value: 'epic' },
          { name: 'Legendary', value: 'legendary' }
        )
    ),
  async execute(client, interaction) {
    const rarity = interaction.options.getString('rarity');

    if (rarity) {
      const items = getItemsByRarity(rarity);
      const rarityColors = {
        common: '#95A5A6',
        uncommon: '#2ECC71',
        rare: '#3498DB',
        epic: '#9B59B6',
        legendary: '#F39C12'
      };

      const embed = new EmbedBuilder()
        .setTitle(`${rarity.charAt(0).toUpperCase() + rarity.slice(1)} Items`)
        .setColor(rarityColors[rarity])
        .setDescription(items.map((item) => `${item.emoji} **${item.name}** — $${item.value} value`).join('\n'));

      return interaction.reply({ embeds: [embed] });
    }

    // Show all items by rarity
    const embeds = [];
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const rarityEmojis = {
      common: '⚪',
      uncommon: '🟢',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟡'
    };
    const rarityColors = {
      common: '#95A5A6',
      uncommon: '#2ECC71',
      rare: '#3498DB',
      epic: '#9B59B6',
      legendary: '#F39C12'
    };

    for (const rar of rarityOrder) {
      const items = RUST_ITEMS[rar];
      const embed = new EmbedBuilder()
        .setTitle(`${rarityEmojis[rar]} ${rar.charAt(0).toUpperCase() + rar.slice(1)} Items`)
        .setColor(rarityColors[rar])
        .setDescription(items.map((item) => `${item.emoji} **${item.name}** — $${item.value} value`).join('\n'));
      embeds.push(embed);
    }

    await interaction.reply({ embeds });
  }
};
