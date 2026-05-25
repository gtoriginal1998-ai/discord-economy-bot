const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { canRunCooldown, getCooldownRemaining } = require('../../utils/cooldowns');
const { getRandomRustItem, getItemRarity } = require('../../utils/rustItems');

function getLoot() {
  const rand = Math.random() * 100;
  // 40% chance coins, 60% chance Rust item
  if (rand < 40) {
    const coinAmounts = [150, 200, 250, 300];
    return { type: 'coins', amount: coinAmounts[Math.floor(Math.random() * coinAmounts.length)] };
  }
  return { type: 'item', item: getRandomRustItem() };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lootpack')
    .setDescription('Open a loot pack with a chance to win coins or rare items.'),
  async execute(client, interaction) {
    const user = client.db.getUser(interaction.guildId, interaction.user.id);

    if (!canRunCooldown(user, 'lastLootpack', config.cooldowns.lootpack)) {
      const remainingMs = getCooldownRemaining(user, 'lastLootpack', config.cooldowns.lootpack);
      return interaction.reply({ content: `Loot pack is on cooldown. Try again in ${Math.ceil(remainingMs / 60000)} minute(s).`, ephemeral: true });
    }

    const loot = getLoot();
    let description = '';
    let embedColor = '#FF7F50';

    if (loot.type === 'coins') {
      client.db.modifyBalance(interaction.guildId, interaction.user.id, loot.amount);
      description = `You get **${loot.amount} coins**!`;
    } else {
      const item = loot.item;
      const rarity = getItemRarity(item.name);
      client.db.addItem(interaction.guildId, interaction.user.id, item.name, 1);
      // Queue for KAOS delivery
      client.db.addDelivery(interaction.guildId, interaction.user.id, item.name, 1);
      description = `You found **${item.emoji} ${item.name}** (${rarity})\n\nUse \`/claim\` to deliver to your game!`; 
      
      // Color by rarity
      const rarityColors = {
        common: '#95A5A6',
        uncommon: '#2ECC71',
        rare: '#3498DB',
        epic: '#9B59B6',
        legendary: '#F39C12'
      };
      embedColor = rarityColors[rarity] || '#FF7F50';
    }

    client.db.addXp(interaction.guildId, interaction.user.id, config.economy.xpPerAction);
    client.db.setCooldown(interaction.guildId, interaction.user.id, 'lastLootpack', Date.now());

    const embed = new EmbedBuilder()
      .setTitle('📦 Loot Pack Opened')
      .setDescription(description)
      .setColor(embedColor);

    await interaction.reply({ embeds: [embed] });
  }
};
