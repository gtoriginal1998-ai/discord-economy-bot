const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const { generateBulkKaosCommands, getRustItemToKaosId } = require('../../utils/kaosIntegration');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Claim your Discord rewards directly to your in-game inventory.'),
  async execute(client, interaction) {
    // Check if KAOS channel is configured
    if (!config.kaos.transactionsChannelId) {
      return interaction.reply({
        content: '❌ KAOS delivery is not configured on this server.',
        ephemeral: true
      });
    }

    // Check if player is linked
    const linked = client.db.getLinkedAccount(interaction.guildId, interaction.user.id);
    if (!linked) {
      return interaction.reply({
        content: '❌ You must link your Rust account first.\nUse `/link <steamid>` to link.',
        ephemeral: true
      });
    }

    // Get pending deliveries
    const pending = client.db.getPendingDeliveries(interaction.guildId, interaction.user.id);
    if (!pending.length) {
      return interaction.reply({
        content: '✅ You have no pending rewards to claim.',
        ephemeral: true
      });
    }

    // Get transactions channel
    const transChannel = await interaction.guild.channels.fetch(config.kaos.transactionsChannelId).catch(() => null);
    if (!transChannel) {
      return interaction.reply({
        content: '❌ KAOS transactions channel not found. Contact an admin.',
        ephemeral: true
      });
    }

    // Generate KAOS commands
    const commands = generateBulkKaosCommands(interaction.user.id, pending, config.kaos.serverId);
    if (!commands.length) {
      return interaction.reply({
        content: '❌ Some items could not be processed. Contact an admin.',
        ephemeral: true
      });
    }

    // Send KAOS commands to transactions channel
    const commandsText = commands.join('\n');
    await transChannel.send(commandsText).catch((err) => {
      console.error('Failed to send KAOS commands:', err);
    });

    // Mark deliveries as delivered
    pending.forEach((delivery) => {
      client.db.markDeliveryComplete(delivery.id);
    });

    // Build confirmation embed
    const claimSummary = pending.map((d) => `**${d.item}** ×${d.quantity}`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('✅ Rewards Claimed!')
      .setDescription(
        `Your rewards have been sent to your in-game inventory on Rust console.\n\n**Delivered:**\n${claimSummary}\n\n⏱️ Items should arrive within 1-2 minutes.`
      )
      .setColor('#2ECC71')
      .setFooter({ text: `Steam ID: ${linked.steamId}` });

    await interaction.reply({ embeds: [embed] });
  }
};
