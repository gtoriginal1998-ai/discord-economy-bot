// Mapping of Rust item names to KAOS item IDs
const KAOS_ITEM_MAP = {
  // Common
  'Wood': 'wood',
  'Stone': 'stone',
  'Cloth': 'cloth',
  'Rope': 'rope',

  // Uncommon
  'Metal Ore': 'metalore',
  'Scrap': 'scrap',
  'Sulfur Ore': 'sulfurore',
  'Leather': 'leather',
  'Gunpowder': 'gunpowder',

  // Rare
  'High Quality Metal': 'hqm',
  'Metal Frags': 'metalfrags',
  'Crude Oil': 'crude.oil',
  'Sewing Kit': 'sewing.kit',
  'Empty Propane Tank': 'propane',

  // Epic
  'Radiation Protection': 'hazmatsuit',
  'Rifle Body': 'rifle.body',
  'SMG Body': 'smg.body',
  'Snow Jacket': 'jacket.snow',
  'Diving Tank': 'diving.tank',

  // Legendary
  'Tier 3 Keycard': 'keycard_blue',
  'Blue Keycard': 'keycard_blue',
  'Green Keycard': 'keycard_green',
  'Fuse': 'fuse',
  'Electric Fuse': 'electric.fuse'
};

/**
 * Convert Rust item name to KAOS item ID
 */
function getRustItemToKaosId(itemName) {
  return KAOS_ITEM_MAP[itemName] || null;
}

/**
 * Generate KAOS command for item delivery
 * Format: [KAOS][ADD][<@{discord_id}>][SERVER]=[ITEM][ITEM_NAME][QUANTITY]
 */
function generateKaosCommand(discordId, kaosItemId, quantity, serverId = '1') {
  return `[KAOS][ADD][<@${discordId}>][${serverId}]=[ITEM][${kaosItemId}][${quantity}]`;
}

/**
 * Generate multiple KAOS commands for bulk delivery
 */
function generateBulkKaosCommands(discordId, items, serverId = '1') {
  return items
    .map((item) => {
      const kaosId = getRustItemToKaosId(item.item);
      if (!kaosId) {
        console.warn(`Item ${item.item} not mapped to KAOS`);
        return null;
      }
      return generateKaosCommand(discordId, kaosId, item.quantity, serverId);
    })
    .filter((cmd) => cmd !== null);
}

module.exports = {
  KAOS_ITEM_MAP,
  getRustItemToKaosId,
  generateKaosCommand,
  generateBulkKaosCommands
};
