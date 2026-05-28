const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { canRunCooldown, getCooldownRemaining } = require('../../utils/cooldowns');
const { getItemByName, getItemRarity } = require('../../utils/rustItems');

const packs = {
  basic: {
    name: 'Basic Pack',
    emoji: '📦',
    cost: 3,
    rewards: ['Elite Kit 1', 'Elite Kit 5', 'Elite Kit 28'],
    color: '#3498DB'
  },
  elite: {
    name: 'Elite Pack',
    emoji: '⭐',
    cost: 6,
    rewards: ['Elite Kit 2', 'Elite Kit 25', 'Elite Kit 7'],
    color: '#9B59B6'
  },
  mega: {
    name: 'Mega Pack',
    emoji: '💎',
    cost: 10,
    rewards: ['Elite Kit 27', 'Elite Kit 9', 'Elite Kit 31'],
    color: '#F39C12'
  }
};

function getRandomReward(packType) {
  const rewards = packs[packType].rewards;
  return rewards[Math.floor(Math.random() * rewards.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lootpack')
    .setDescription('Open a loot pack with exclusive items!')
    .addStringOption(option =>
      option.setName('pack')
        .setDescription('Which pack do you want to open?')
        .setRequired(true)
        .addChoices(
          { name: 'Basic Pack (3 tickets)', value: 'basic' },
          { name: 'Elite Pack (6 tickets)', value: 'elite' },
          { name: 'Mega Pack (10 tickets)', value: 'mega' }
        )
    ),
  async execute(client, interaction) {
    const user = client.db.getUser(interaction.guildId, interaction.user.id);
    const packType = interaction.options.getString('pack');
    const pack = packs[packType];

    if (user.tickets < pack.cost) {
      return interaction.reply({ content: `You need ${pack.cost} tickets to open the ${pack.name}. You have ${user.tickets}.`, ephemeral: true });
    }

    if (!canRunCooldown(user, 'lastLootpack', config.cooldowns.lootpack)) {
      const remainingMs = getCooldownRemaining(user, 'lastLootpack', config.cooldowns.lootpack);
      return interaction.reply({ content: `Loot pack is on cooldown. Try again in ${Math.ceil(remainingMs / 60000)} minute(s).`, ephemeral: true });
    }

    // Deduct ticket cost
    client.db.addTickets(interaction.guildId, interaction.user.id, -pack.cost);

    // Get random reward from pack
    const itemName = getRandomReward(packType);
    const itemData = getItemByName(itemName);
    const rarity = getItemRarity(itemName);

    // Add to inventory and queue for KAOS delivery
    client.db.addItem(interaction.guildId, interaction.user.id, itemName, 1);
    client.db.addDelivery(interaction.guildId, interaction.user.id, itemName, 1);
    client.db.addXp(interaction.guildId, interaction.user.id, config.economy.xpPerAction);
    client.db.setCooldown(interaction.guildId, interaction.user.id, 'lastLootpack', Date.now());

    const embed = new EmbedBuilder()
      .setTitle(`${pack.emoji} ${pack.name} Opened`)
      .setDescription(`You received **${itemData.emoji} ${itemName}** (${rarity})\n\nUse \`/claim\` to deliver to your game!`)
      .setColor(pack.color)
      .setFooter({ text: `Pack cost: ${pack.cost} tickets` });

    await interaction.reply({ embeds: [embed] });
  }
};

