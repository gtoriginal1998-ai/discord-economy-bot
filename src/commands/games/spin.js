const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { canRunCooldown, getCooldownRemaining } = require('../../utils/cooldowns');

const outcomes = [
  { label: 'Small Win', reward: 75, color: '#57F287' },
  { label: 'Medium Win', reward: 150, color: '#F1C40F' },
  { label: 'Jackpot', reward: 400, color: '#E74C3C' },
  { label: 'Item Drop', item: 'Gold Ticket', color: '#9B59B6' },
  { label: 'Nothing', reward: 0, color: '#95A5A6' }
];

function rollWheel() {
  return outcomes[Math.floor(Math.random() * outcomes.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spin')
    .setDescription('Spin the wheel for coins or items.'),
  async execute(client, interaction) {
    const user = client.db.getUser(interaction.guildId, interaction.user.id);
    if (user.balance < config.economy.spinCost) {
      return interaction.reply({ content: `You need ${config.economy.spinCost} coins to spin the wheel.`, ephemeral: true });
    }

    if (!canRunCooldown(user, 'lastSpin', config.cooldowns.spin)) {
      const remainingMs = getCooldownRemaining(user, 'lastSpin', config.cooldowns.spin);
      return interaction.reply({ content: `Spin is on cooldown. Try again in ${Math.ceil(remainingMs / 60000)} minute(s).`, ephemeral: true });
    }

    client.db.modifyBalance(interaction.guildId, interaction.user.id, -config.economy.spinCost);
    const result = rollWheel();
    let description = `You spun the wheel and landed on **${result.label}**.`;

    if (result.reward) {
      client.db.modifyBalance(interaction.guildId, interaction.user.id, result.reward);
      description += ` You earned **${result.reward} coins**.`;
    } else if (result.item) {
      client.db.addItem(interaction.guildId, interaction.user.id, result.item, 1);
      description += ` You received **${result.item}**.`;
    }

    client.db.addXp(interaction.guildId, interaction.user.id, config.economy.xpPerAction);
    client.db.setCooldown(interaction.guildId, interaction.user.id, 'lastSpin', Date.now());

    const embed = new EmbedBuilder()
      .setTitle('Spinner Wheel')
      .setDescription(description)
      .setColor(result.color || '#7289DA');

    await interaction.reply({ embeds: [embed] });
  }
};
