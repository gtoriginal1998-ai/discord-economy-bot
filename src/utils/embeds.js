const { EmbedBuilder } = require('discord.js');

function createDefaultEmbed({ title, description, color = '#5865F2', fields = [] }) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setTimestamp();

  if (fields.length) embed.addFields(fields);
  return embed;
}

module.exports = {
  createDefaultEmbed
};
