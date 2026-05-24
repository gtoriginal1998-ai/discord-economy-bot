const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const config = require('../config');
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
      if (user.balance < raffle.entryCost) {
        return interaction.reply({ content: `You need ${raffle.entryCost} coins to enter this raffle.`, ephemeral: true });
      }

      client.db.modifyBalance(interaction.guildId, interaction.user.id, -raffle.entryCost);
      client.db.addRaffleEntry(raffle.id, interaction.user.id, 1);
      client.db.addXp(interaction.guildId, interaction.user.id, config.economy.xpPerAction);

      return interaction.reply({ content: `You entered the raffle and paid ${raffle.entryCost} coins. Good luck!`, ephemeral: true });
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
