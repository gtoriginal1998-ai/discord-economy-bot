const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { canRunCooldown, getCooldownRemaining } = require('../../utils/cooldowns');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Buy raffle tickets for the economy system.')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Number of tickets to purchase')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(false)
    ),
  async execute(client, interaction) {
    const amount = interaction.options.getInteger('amount') || 1;
    const totalCost = amount * config.economy.ticketCost;
    const user = client.db.getUser(interaction.guildId, interaction.user.id);

    if (!canRunCooldown(user, 'lastTicket', config.cooldowns.ticket)) {
      const remainingMs = getCooldownRemaining(user, 'lastTicket', config.cooldowns.ticket);
      return interaction.reply({ content: `You are buying tickets too fast. Wait ${Math.ceil(remainingMs / 1000)} seconds.`, ephemeral: true });
    }

    if (user.balance < totalCost) {
      return interaction.reply({ content: `You need ${totalCost} coins to buy ${amount} ticket(s).`, ephemeral: true });
    }

    client.db.modifyBalance(interaction.guildId, interaction.user.id, -totalCost);
    client.db.addTickets(interaction.guildId, interaction.user.id, amount);
    client.db.addXp(interaction.guildId, interaction.user.id, config.economy.xpPerAction);
    client.db.setCooldown(interaction.guildId, interaction.user.id, 'lastTicket', Date.now());

    const embed = new EmbedBuilder()
      .setTitle('Ticket Purchase Complete')
      .setDescription(`You purchased ${amount} raffle ticket(s) for ${totalCost} coins.`)
      .setColor('#8C84FF');

    await interaction.reply({ embeds: [embed] });
  }
};
