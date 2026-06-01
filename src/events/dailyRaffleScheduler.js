/**
 * Daily Raffle Scheduler
 *
 * Runs an hourly tick. When the current UTC hour matches `drawHourUTC` the
 * scheduler:
 *   1. Closes any open raffle from the previous cycle and announces the winner.
 *   2. Opens a fresh raffle for today's prize and posts an embed with a Join
 *      button to the configured raffle channel.
 *
 * No external cron library is required — a simple setInterval is used so the
 * bot has zero new production dependencies.
 *
 * Environment variable required:
 *   RAFFLE_CHANNEL_ID  – The Discord channel ID where raffle embeds are posted.
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const raffleConfig = require('../config/dailyRaffles');

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build the raffle announcement embed shown when a new raffle opens.
 *
 * @param {object} raffle     - The raffle record from the database.
 * @param {string} dayName    - Human-readable draw day name (e.g. "Monday").
 * @param {number} entryCount - Current number of entries for this raffle.
 */
function buildRaffleEmbed(raffle, dayName, entryCount) {
  return new EmbedBuilder()
    .setTitle('🎟️ Daily Raffle — Open Now!')
    .setDescription(
      `Today's prize is **${raffle.prize}**.\n\n` +
      `Click **Join Raffle** below to enter for just **${raffle.entryCost} ticket**.\n` +
      `The winner will be drawn at the same time tomorrow.`
    )
    .addFields(
      { name: 'Prize', value: raffle.prize, inline: true },
      { name: 'Entry Cost', value: `${raffle.entryCost} ticket`, inline: true },
      { name: 'Draw Day', value: dayName, inline: true },
      { name: 'Current Entries', value: String(entryCount), inline: true }
    )
    .setColor('#F39C12')
    .setFooter({ text: 'Good luck! One entry per user.' })
    .setTimestamp();
}

/**
 * Build the winner announcement embed posted when a raffle is drawn.
 */
function buildWinnerEmbed(raffle, winnerId) {
  return new EmbedBuilder()
    .setTitle('🎉 Raffle Drawn!')
    .setDescription(
      winnerId
        ? `Congratulations <@${winnerId}>! You won **${raffle.prize}**!`
        : `The raffle for **${raffle.prize}** closed with no entries. No winner this time.`
    )
    .setColor(winnerId ? '#2ECC71' : '#95A5A6')
    .setTimestamp();
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ── Core logic ────────────────────────────────────────────────────────────────

/**
 * Perform one scheduler tick.
 *
 * @param {import('../client/Client')} client
 */
async function runTick(client) {
  const { raffle: raffleSettings, guildId } = client.config;

  if (!raffleSettings.enabled) return;
  if (!raffleSettings.channelId) {
    console.warn('[DailyRaffle] RAFFLE_CHANNEL_ID is not set — skipping tick.');
    return;
  }

  const nowUTC = new Date();
  const currentHourUTC = nowUTC.getUTCHours();

  // Only act during the draw hour
  if (currentHourUTC !== raffleConfig.drawHourUTC) return;

  // Use a date string (YYYY-MM-DD UTC) as a guard so we only fire once per day
  // even if the interval fires multiple times within the same hour.
  const todayKey = `${nowUTC.getUTCFullYear()}-${nowUTC.getUTCMonth()}-${nowUTC.getUTCDate()}`;
  if (client._lastRaffleDrawDate === todayKey) return;
  client._lastRaffleDrawDate = todayKey;

  console.log('[DailyRaffle] Draw hour reached — running daily raffle cycle.');

  try {
    const channel = await client.channels.fetch(raffleSettings.channelId).catch(() => null);
    if (!channel) {
      console.error('[DailyRaffle] Could not fetch raffle channel:', raffleSettings.channelId);
      return;
    }

    // ── Step 1: Close any open raffle and announce the winner ────────────────
    const openRaffle = client.db.getOpenRaffle(guildId);
    if (openRaffle) {
      const winnerId = client.db.drawRaffleWinner(openRaffle.id);
      client.db.closeRaffle(openRaffle.id);
      client.db.setRaffleDay(guildId, null);

      const winnerEmbed = buildWinnerEmbed(openRaffle, winnerId);
      await channel.send({ embeds: [winnerEmbed] });

      // Disable the Join button on the original raffle message (best-effort)
      const oldMessageId = client.db.getRaffleMessageId(guildId);
      if (oldMessageId) {
        try {
          const oldMessage = await channel.messages.fetch(oldMessageId);
          const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`raffle_join:${openRaffle.id}`)
              .setLabel('Raffle Closed')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
          );
          await oldMessage.edit({ components: [disabledRow] });
        } catch {
          // Message may have been deleted — not a fatal error
        }
        client.db.setRaffleMessageId(guildId, null);
      }

      console.log(
        `[DailyRaffle] Raffle #${openRaffle.id} closed. Winner: ${winnerId ?? 'none'}`
      );
    }

    // ── Step 2: Open a new raffle for today ──────────────────────────────────
    const todayDayOfWeek = nowUTC.getUTCDay(); // 0 = Sunday … 6 = Saturday
    const prize = raffleConfig.dailyRewards[todayDayOfWeek];

    if (!prize) {
      console.warn(`[DailyRaffle] No prize configured for day ${todayDayOfWeek} — skipping open.`);
      return;
    }

    const newRaffle = client.db.createRaffle(guildId, prize, raffleConfig.entryCost);
    client.db.setRaffleDay(guildId, todayDayOfWeek);

    const joinRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`raffle_join:${newRaffle.id}`)
        .setLabel('Join Raffle')
        .setStyle(ButtonStyle.Primary)
    );

    const entryCount = client.db.getRaffleEntries(newRaffle.id).length;
    const raffleEmbed = buildRaffleEmbed(newRaffle, DAY_NAMES[todayDayOfWeek], entryCount);
    const sentMessage = await channel.send({ embeds: [raffleEmbed], components: [joinRow] });
    client.db.setRaffleMessageId(guildId, sentMessage.id);

    console.log(
      `[DailyRaffle] New raffle #${newRaffle.id} opened for ${DAY_NAMES[todayDayOfWeek]} — prize: ${prize}`
    );
  } catch (err) {
    console.error('[DailyRaffle] Error during raffle cycle:', err);
  }
}

// ── Scheduler bootstrap ───────────────────────────────────────────────────────

/**
 * Start the daily raffle scheduler.
 * Called once from the `ready` event after the bot is logged in.
 *
 * @param {import('../client/Client')} client
 */
function startDailyRaffleScheduler(client) {
  // Run an immediate tick in case the bot restarted during the draw hour
  runTick(client);

  // Then check every 5 minutes so we don't miss the window
  const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  setInterval(() => runTick(client), INTERVAL_MS);

  console.log(
    `[DailyRaffle] Scheduler started — checking every 5 minutes for draw hour ${raffleConfig.drawHourUTC}:00 UTC.`
  );
}

module.exports = { startDailyRaffleScheduler };
