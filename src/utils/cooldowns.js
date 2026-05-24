function canRunCooldown(user, key, duration) {
  if (!user || typeof user[key] !== 'number') return true;
  return Date.now() - user[key] >= duration;
}

function getCooldownRemaining(user, key, duration) {
  if (!user || typeof user[key] !== 'number') return 0;
  const remaining = duration - (Date.now() - user[key]);
  return remaining > 0 ? remaining : 0;
}

module.exports = {
  canRunCooldown,
  getCooldownRemaining
};
