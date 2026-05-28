/**
 * Daily raffle configuration.
 *
 * drawHourUTC  – The UTC hour at which the raffle is drawn / a new one opens.
 *                5:00 PM BST = 16:00 UTC (winter/GMT) or 17:00 UTC (summer/BST).
 *                We use 16 here so the draw fires at 4 PM UTC, which is always
 *                5 PM London time regardless of DST (BST = UTC+1, GMT = UTC+0).
 *                Change to 17 if you want strict UTC+1 summer-only behaviour.
 *
 * entryCost    – Number of tickets required to enter.
 *
 * dailyRewards – Prize string keyed by JS day-of-week (0 = Sunday … 6 = Saturday).
 *                The day used is the day the raffle is *drawn* (i.e. the day it
 *                was opened the previous cycle).
 */
module.exports = {
  drawHourUTC: 16, // 4 PM UTC = 5 PM BST (UTC+1)
  entryCost: 1,    // 1 ticket to enter

  // Rewards by day of week (0 = Sunday, 1 = Monday, … 6 = Saturday)
  dailyRewards: {
    0: 'Elite Kit 7',              // Sunday
    1: 'Elite Kit 1',              // Monday
    2: 'Elite Kit 25',             // Tuesday
    3: '500,000 Points',           // Wednesday
    4: '50 Tickets',               // Thursday
    5: 'Elite Kit 11',             // Friday
    6: '£20 K1NGz STORE Gift Card' // Saturday
  }
};
