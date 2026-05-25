# KAOS Integration Setup Guide

Your Discord economy bot now has full integration with KAOS for Rust Console Edition. Players can earn rewards in Discord and claim them directly to their in-game inventory.

---

## Configuration

### 1. Set Environment Variables

Add these to your `.env` file:

```env
KAOS_CHANNEL_ID=YOUR_TRANSACTIONS_CHANNEL_ID
KAOS_SERVER_ID=1
```

**KAOS_CHANNEL_ID**: The Discord channel ID where KAOS reads delivery commands
- Go to your `kaos-parser` or transactions channel
- Right-click → Copy Channel ID
- Paste into `.env`

**KAOS_SERVER_ID**: Your Rust server ID in KAOS (usually `1`, but check your setup)

### 2. Verify KAOS Setup

Make sure:
- ✅ KAOS bot is invited to your Discord
- ✅ Tip4Serv bot has message permissions in your transactions channel
- ✅ You've run `/admin-channels` in KAOS to set the transactions channel
- ✅ Your game server is connected to Tip4Serv/KAOS

---

## Player Workflow

### Step 1: Link Account
Players link their console account to Discord:
```
/link <steamid>
```
Example: `/link 110000100000000`

**Get Steam ID**: 
- In Rust console, press Tab, click your name → copy Steam ID3
- Or use online Steam ID finder (search "SteamID converter")

### Step 2: Earn Rewards
Players earn Rust items through:
- `/lootpack` — 60% chance for rare items
- `/spin` — Spin wheel for items/coins
- `/daily` — Daily coins
- Raffle wins

When they earn an item, it's automatically queued for delivery:
```
You found 🥇 High Quality Metal (rare)
Use `/claim` to deliver to your game!
```

### Step 3: Claim Rewards
Player runs:
```
/claim
```

This:
1. ✅ Converts Discord items to KAOS format
2. ✅ Sends delivery commands to KAOS
3. ✅ Items arrive in-game within 1-2 minutes

### Related Commands
- `/linked` — Check linked account & pending items
- `/unlink` — Remove account link
- `/inventory` — View Discord inventory before claiming
- `/sell <item> [qty]` — Sell items for coins instead of claiming

---

## Supported Rust Items (Mapped to KAOS)

### Common Items
- Wood, Stone, Cloth, Rope

### Uncommon Items
- Metal Ore, Scrap, Sulfur Ore, Leather, Gunpowder

### Rare Items
- High Quality Metal (hqm), Metal Frags, Crude Oil, Sewing Kit, Empty Propane Tank

### Epic Items
- Radiation Protection, Rifle Body, SMG Body, Snow Jacket, Diving Tank

### Legendary Items
- Tier 3 Keycard, Blue Keycard, Green Keycard, Fuse, Electric Fuse

**Note**: If you want to add more items, edit `src/utils/kaosIntegration.js` and add to `KAOS_ITEM_MAP`.

---

## How It Works Under the Hood

1. Player runs `/claim`
2. Bot checks if linked to a Steam ID
3. Bot fetches pending deliveries from database
4. Bot converts item names to KAOS item IDs
5. Bot generates KAOS commands:
   ```
   [KAOS][ADD][<@DISCORD_ID>][1]=[ITEM][rifle.ak][1]
   [KAOS][ADD][<@DISCORD_ID>][1]=[ITEM][hqm][5]
   ```
6. Bot sends commands to your transactions channel
7. KAOS parses commands and queues items
8. Tip4Serv delivers items to player on their next login
9. Bot marks items as delivered

---

## Troubleshooting

### "KAOS delivery is not configured"
- **Fix**: Add `KAOS_CHANNEL_ID` to `.env` and restart bot

### "You must link your Rust account first"
- **Fix**: Player runs `/link <steamid>` first

### Items not arriving in-game
- ✅ Check player is online in Rust
- ✅ Verify KAOS/Tip4Serv is running
- ✅ Check transactions channel has KAOS parsing enabled
- ✅ Check bot has message permissions in channel
- ✅ Restart bot and try again

### "Some items could not be processed"
- **Reason**: Item not in `KAOS_ITEM_MAP`
- **Fix**: Edit `src/utils/kaosIntegration.js` and add the item mapping

### Wrong Steam ID?
- Player runs `/unlink` then `/link <correctid>`

---

## Admin Commands

Create a new command file `src/commands/admin/giveitem.js` to manually deliver items:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveitem')
    .setDescription('Admin: Give item to a player')
    .addUserOption(opt => opt.setName('user').setDescription('Player').setRequired(true))
    .addStringOption(opt => opt.setName('item').setDescription('Item name').setRequired(true))
    .addIntegerOption(opt => opt.setName('qty').setDescription('Quantity').setRequired(true)),
  async execute(client, interaction) {
    const user = interaction.options.getUser('user');
    const item = interaction.options.getString('item');
    const qty = interaction.options.getInteger('qty');
    
    client.db.addDelivery(interaction.guildId, user.id, item, qty);
    
    await interaction.reply({ 
      content: `✅ Added ${qty}x ${item} for <@${user.id}>`, 
      ephemeral: true 
    });
  }
};
```

---

## Testing

1. Link a test account: `/link 110000100000000`
2. Spin the wheel: `/spin`
3. Check pending: `/linked`
4. Claim: `/claim`
5. Check KAOS transactions channel for the command
6. Login to Rust console and verify item arrived

---

## Customization

### Add New Item
Edit `src/utils/kaosIntegration.js`:

```javascript
const KAOS_ITEM_MAP = {
  // Add your item:
  'My Item': 'kaos_item_id',
  // ...
};
```

Then add to `src/utils/rustItems.js`:

```javascript
const RUST_ITEMS = {
  rare: [
    { name: 'My Item', emoji: '🎯', value: 100 },
    // ...
  ]
};
```

### Change Drop Rates
Edit `src/commands/games/lootpack.js`:

```javascript
function getLoot() {
  const rand = Math.random() * 100;
  if (rand < 70) { // 70% coins instead of 40%
    // ...
  }
}
```

---

## Support

- **KAOS Docs**: https://docs.tip4serv.com/games/rust-console-edition/kaos-discord-bot
- **KAOS Parser Generator**: https://bot.ka0s.uk/parser-generator/
- **Issue**: Check `.env` is set correctly and bot is restarted

---

**You're all set! Your players can now earn Discord rewards and claim them to their Rust console inventory.** 🎮✨
