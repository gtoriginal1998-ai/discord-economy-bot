const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const { getCooldownRemaining } = require('../utils/cooldowns');

module.exports = {
  name: 'interactionCreate',
  async execute(client, interaction) {
    if (interaction.isButton()) {
      const [action, raffleId] = interaction.customId.split(':');
      if (action !== 'raffle_join') return;

      const raffle = client.db.getOpenRaffle(interaction.guildId);
      if (!raffle || raffle.id.toString() !== raffleId) {
        return interaction.reply({ content: 'There is no active raffle to join.', ephemeral: true });
      }

      const user = client.db.getUser(interaction.guildId, interaction.user.id);

      // Check whether the user has already entered this raffle
      const existingEntries = client.db.getRaffleEntries(raffle.id);
      if (existingEntries.some((e) => e.userId === interaction.user.id)) {
        return interaction.reply({ content: 'You have already entered this raffle.', ephemeral: true });
      }

      if (user.tickets < raffle.entryCost) {
        return interaction.reply({
          content: `You need **${raffle.entryCost} ticket${raffle.entryCost !== 1 ? 's' : ''}** to enter this raffle but you only have **${user.tickets}**.`,
          ephemeral: true
        });
      }

      client.db.addTickets(interaction.guildId, interaction.user.id, -raffle.entryCost);
      client.db.addRaffleEntry(raffle.id, interaction.user.id, 1);

      return interaction.reply({
        content: `✅ You entered the raffle and spent **${raffle.entryCost} ticket${raffle.entryCost !== 1 ? 's' : ''}**. Good luck! 🍀`,
        ephemeral: true
      });
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(client, interaction);
    } catch (error) {
      console.error('Command failed:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while running this command.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'There was an error while running this command.', ephemeral: true });
      }
    }
  }
};
