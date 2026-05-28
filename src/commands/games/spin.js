const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { canRunCooldown, getCooldownRemaining } = require('../../utils/cooldowns');
const { getItemRarity, getItemByName } = require('../../utils/rustItems');

// Spinner outcomes with weighted probabilities and quantity ranges
const outcomes = [
  { name: 'AK', probability: 12.67, minQty: 3, maxQty: 9 },
  { name: 'Explo Ammo', probability: 12.67, minQty: 1000, maxQty: 3000 },
  { name: 'HQM', probability: 12.67, minQty: 9000, maxQty: 20000 },
  { name: 'M249', probability: 12.67, minQty: 1, maxQty: 3 },
  { name: 'Metal Frags', probability: 12.67, minQty: 10000, maxQty: 25000 },
  { name: 'Supply Signal', probability: 12.67, minQty: 1, maxQty: 3 },
  { name: 'C4', probability: 9.00, minQty: 2, maxQty: 10 },
  { name: 'Rockets', probability: 8.00, minQty: 5, maxQty: 25 }
];

function rollWheel() {
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const outcome of outcomes) {
    cumulative += outcome.probability;
    if (rand <= cumulative) {
      const quantity = Math.floor(Math.random() * (outcome.maxQty - outcome.minQty + 1)) + outcome.minQty;
      return { ...outcome, quantity };
    }
  }

  // Fallback (shouldn't reach here)
  return { ...outcomes[0], quantity: Math.floor(Math.random() * (outcomes[0].maxQty - outcomes[0].minQty + 1)) + outcomes[0].minQty };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spin')
    .setDescription('Spin the wheel to win Rust items!'),
  async execute(client, interaction) {
    const user = client.db.getUser(interaction.guildId, interaction.user.id);
    if (user.tickets < config.economy.spinCost) {
      return interaction.reply({ content: `You need ${config.economy.spinCost} tickets to spin the wheel. You have ${user.tickets}.`, ephemeral: true });
    }

    if (!canRunCooldown(user, 'lastSpin', config.cooldowns.spin)) {
      const remainingMs = getCooldownRemaining(user, 'lastSpin', config.cooldowns.spin);
      return interaction.reply({ content: `Spin is on cooldown. Try again in ${Math.ceil(remainingMs / 60000)} minute(s).`, ephemeral: true });
    }

    client.db.addTickets(interaction.guildId, interaction.user.id, -config.economy.spinCost);
    const result = rollWheel();
    const itemData = getItemByName(result.name);
    const rarity = getItemRarity(result.name);

    // Add item to inventory and queue for KAOS delivery
    client.db.addItem(interaction.guildId, interaction.user.id, result.name, result.quantity);
    client.db.addDelivery(interaction.guildId, interaction.user.id, result.name, result.quantity);
    client.db.addXp(interaction.guildId, interaction.user.id, config.economy.xpPerAction);
    client.db.setCooldown(interaction.guildId, interaction.user.id, 'lastSpin', Date.now());

    const rarityColors = {
      common: '#95A5A6',
      uncommon: '#2ECC71',
      rare: '#3498DB',
      epic: '#9B59B6',
      legendary: '#F39C12'
    };

    const embed = new EmbedBuilder()
      .setTitle('🎡 Spinner Wheel')
      .setDescription(`You won **${result.quantity.toLocaleString()}x ${itemData.emoji} ${result.name}** (${rarity})\n\nUse \`/claim\` to deliver to your game!`)
      .setColor(rarityColors[rarity] || '#7289DA')
      .setFooter({ text: `Spin cost: ${config.economy.spinCost} tickets` });

    await interaction.reply({ embeds: [embed] });
  }
};

