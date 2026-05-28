const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { canRunCooldown, getCooldownRemaining } = require('../../utils/cooldowns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Claim your daily reward.'),
  async execute(client, interaction) {
    const user = client.db.getUser(interaction.guildId, interaction.user.id);
    const cooldown = config.cooldowns.daily;

    if (!canRunCooldown(user, 'lastDaily', cooldown)) {
      const remainingMs = getCooldownRemaining(user, 'lastDaily', cooldown);
      const hours = Math.ceil(remainingMs / (1000 * 60 * 60));
      return interaction.reply({ content: `Daily reward is on cooldown. Try again in ${hours} hour(s).`, ephemeral: true });
    }

    client.db.addTickets(interaction.guildId, interaction.user.id, config.economy.dailyReward);
    client.db.addXp(interaction.guildId, interaction.user.id, config.economy.xpPerAction);
    client.db.setCooldown(interaction.guildId, interaction.user.id, 'lastDaily', Date.now());

    const embed = new EmbedBuilder()
      .setTitle('Daily Reward Claimed')
      .setDescription(`You claimed ${config.economy.dailyReward} tickets and gained ${config.economy.xpPerAction} XP.`)
      .setColor('#FFD166');

    await interaction.reply({ embeds: [embed] });
  }
};
