const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check whether the bot is online.'),
  async execute(client, interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    await interaction.editReply(`Pong! Latency: ${sent.createdTimestamp - interaction.createdTimestamp}ms`);
  }
};
