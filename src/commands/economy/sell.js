const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getItemByName } = require('../../utils/rustItems');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Sell items from your inventory for tickets.')
    .addStringOption((option) => option.setName('item').setDescription('Item name to sell').setRequired(true))
    .addIntegerOption((option) =>
      option.setName('quantity').setDescription('How many to sell').setMinValue(1).setMaxValue(100).setRequired(false)
    ),
  async execute(client, interaction) {
    const itemName = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantity') || 1;

    const itemData = getItemByName(itemName);
    if (!itemData) {
      return interaction.reply({ content: `Item **${itemName}** not found. Use \`/items\` to see available items.`, ephemeral: true });
    }

    const inventory = client.db.getInventory(interaction.guildId, interaction.user.id);
    const inventoryItem = inventory.find((inv) => inv.item === itemName);

    if (!inventoryItem || inventoryItem.quantity < quantity) {
      const available = inventoryItem?.quantity || 0;
      return interaction.reply({
        content: `You only have ${available} **${itemName}** to sell, but tried to sell ${quantity}.`,
        ephemeral: true
      });
    }

    const totalTickets = itemData.value * quantity;

    // Remove from inventory by updating quantity or deleting
    client.db.db
      .prepare('UPDATE inventory SET quantity = quantity - ? WHERE guildId = ? AND userId = ? AND item = ?')
      .run(quantity, interaction.guildId, interaction.user.id, itemName);

    // Clean up zero-quantity items
    client.db.db.prepare('DELETE FROM inventory WHERE quantity <= 0').run();

    // Add tickets
    client.db.addTickets(interaction.guildId, interaction.user.id, totalTickets);

    const embed = new EmbedBuilder()
      .setTitle('✅ Sale Complete')
      .setDescription(`You sold **${quantity}x ${itemData.emoji} ${itemName}** for **${totalTickets} tickets**.`)
      .setColor('#2ECC71');

    await interaction.reply({ embeds: [embed] });
  }
};
