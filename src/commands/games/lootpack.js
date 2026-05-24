const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { canRunCooldown, getCooldownRemaining } = require('../../utils/cooldowns');

const pool = [
  { type: 'coins', amount: 200 },
  { type: 'coins', amount: 300 },
  { type: 'item', name: 'Mystery Token' },
  { type: 'item', name: 'Lucky Charm' },
  { type: 'item', name: 'Epic Crystal' },
  { type: 'coins', amount: 500 }
];

function getLoot() {
  return pool[Math.floor(Math.random() * pool.length)];
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

    if (loot.type === 'coins') {
      client.db.modifyBalance(interaction.guildId, interaction.user.id, loot.amount);
      description = `You get **${loot.amount} coins**!`;
    } else {
      client.db.addItem(interaction.guildId, interaction.user.id, loot.name, 1);
      description = `You found **${loot.name}**!`; 
    }

    client.db.addXp(interaction.guildId, interaction.user.id, config.economy.xpPerAction);
    client.db.setCooldown(interaction.guildId, interaction.user.id, 'lastLootpack', Date.now());

    const embed = new EmbedBuilder()
      .setTitle('Loot Pack Opened')
      .setDescription(description)
      .setColor('#FF7F50');

    await interaction.reply({ embeds: [embed] });
  }
};
