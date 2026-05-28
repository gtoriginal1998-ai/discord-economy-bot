// Rust items organized by rarity for drop tables
const RUST_ITEMS = {
  // Common items (highest drop rate)
  common: [
    { name: 'Wood', emoji: '🪵', value: 10 },
    { name: 'Stone', emoji: '🪨', value: 15 },
    { name: 'Cloth', emoji: '🧵', value: 20 },
    { name: 'Rope', emoji: '🪢', value: 25 }
  ],

  // Uncommon items (medium drop rate)
  uncommon: [
    { name: 'Metal Ore', emoji: '⚙️', value: 50 },
    { name: 'Scrap', emoji: '📦', value: 60 },
    { name: 'Sulfur Ore', emoji: '💛', value: 75 },
    { name: 'Leather', emoji: '🎒', value: 45 },
    { name: 'Gunpowder', emoji: '💥', value: 80 }
  ],

  // Rare items (low drop rate)
  rare: [
    { name: 'High Quality Metal', emoji: '🥇', value: 150 },
    { name: 'Metal Frags', emoji: '🔧', value: 120 },
    { name: 'Crude Oil', emoji: '🛢️', value: 140 },
    { name: 'Sewing Kit', emoji: '🧵', value: 100 },
    { name: 'Empty Propane Tank', emoji: '⛽', value: 130 },
    { name: 'HQM', emoji: '💎', value: 200 },
    { name: 'Explo Ammo', emoji: '💣', value: 180 }
  ],

  // Epic items (very rare)
  epic: [
    { name: 'Radiation Protection', emoji: '☢️', value: 250 },
    { name: 'Rifle Body', emoji: '🔫', value: 300 },
    { name: 'SMG Body', emoji: '🎯', value: 280 },
    { name: 'Snow Jacket', emoji: '🧥', value: 200 },
    { name: 'Diving Tank', emoji: '🤿', value: 220 },
    { name: 'Supply Signal', emoji: '📡', value: 400 },
    { name: 'Rockets', emoji: '🚀', value: 350 }
  ],

  // Legendary items (extremely rare)
  legendary: [
    { name: 'Tier 3 Keycard', emoji: '🔑', value: 500 },
    { name: 'Blue Keycard', emoji: '🔷', value: 450 },
    { name: 'Green Keycard', emoji: '🟢', value: 400 },
    { name: 'Fuse', emoji: '⚡', value: 350 },
    { name: 'Electric Fuse', emoji: '⚙️', value: 380 },
    { name: 'AK', emoji: '🔫', value: 600 },
    { name: 'M249', emoji: '🎖️', value: 550 },
    { name: 'C4', emoji: '💣', value: 500 },
    { name: 'Elite Kit 1', emoji: '📦', value: 800 },
    { name: 'Elite Kit 2', emoji: '📦', value: 800 },
    { name: 'Elite Kit 5', emoji: '📦', value: 800 },
    { name: 'Elite Kit 7', emoji: '📦', value: 800 },
    { name: 'Elite Kit 9', emoji: '📦', value: 800 },
    { name: 'Elite Kit 25', emoji: '📦', value: 800 },
    { name: 'Elite Kit 27', emoji: '📦', value: 800 },
    { name: 'Elite Kit 28', emoji: '📦', value: 800 },
    { name: 'Elite Kit 31', emoji: '📦', value: 800 }
  ]
};

/**
 * Get a random item weighted by rarity
 * Rarity chances: Common 50%, Uncommon 25%, Rare 15%, Epic 7%, Legendary 3%
 */
function getRandomRustItem() {
  const rand = Math.random() * 100;

  if (rand < 50) {
    return RUST_ITEMS.common[Math.floor(Math.random() * RUST_ITEMS.common.length)];
  } else if (rand < 75) {
    return RUST_ITEMS.uncommon[Math.floor(Math.random() * RUST_ITEMS.uncommon.length)];
  } else if (rand < 90) {
    return RUST_ITEMS.rare[Math.floor(Math.random() * RUST_ITEMS.rare.length)];
  } else if (rand < 97) {
    return RUST_ITEMS.epic[Math.floor(Math.random() * RUST_ITEMS.epic.length)];
  } else {
    return RUST_ITEMS.legendary[Math.floor(Math.random() * RUST_ITEMS.legendary.length)];
  }
}

/**
 * Get all items from a specific rarity
 */
function getItemsByRarity(rarity) {
  return RUST_ITEMS[rarity] || [];
}

/**
 * Get rarity tier of an item
 */
function getItemRarity(itemName) {
  for (const [rarity, items] of Object.entries(RUST_ITEMS)) {
    if (items.some((item) => item.name === itemName)) {
      return rarity;
    }
  }
  return null;
}

/**
 * Get item object by name
 */
function getItemByName(itemName) {
  for (const items of Object.values(RUST_ITEMS)) {
    const item = items.find((i) => i.name === itemName);
    if (item) return item;
  }
  return null;
}

module.exports = {
  RUST_ITEMS,
  getRandomRustItem,
  getItemsByRarity,
  getItemRarity,
  getItemByName
};
