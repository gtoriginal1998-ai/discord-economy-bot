const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('raffle')
    .setDescription('Manage a raffle for your server.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('start')
        .setDescription('Start a new raffle.')
        .addStringOption((option) => option.setName('prize').setDescription('The raffle prize').setRequired(true))
        .addIntegerOption((option) => option.setName('cost').setDescription('Entry cost in coins').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('close')
        .setDescription('Close the current raffle and choose a winner.')
    ),
  async execute(client, interaction) {
    const subcommand = interaction.options.getSubcommand();
    const member = interaction.member;

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !(client.config.adminRoleId && member.roles.cache.has(client.config.adminRoleId))) {
      return interaction.reply({ content: 'You need Manage Server permissions or the configured admin role to run this command.', ephemeral: true });
    }

    if (subcommand === 'start') {
      const prize = interaction.options.getString('prize');
      const cost = interaction.options.getInteger('cost');
      const raffle = client.db.createRaffle(interaction.guildId, prize, cost);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`raffle_join:${raffle.id}`)
          .setLabel('Join Raffle')
          .setStyle(ButtonStyle.Primary)
      );

      const embed = new EmbedBuilder()
        .setTitle('Raffle Started')
        .setDescription(`Prize: **${prize}**\nEntry Cost: **${cost} coins**\nClick the button to join.`)
        .setColor('#F39C12');

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    if (subcommand === 'close') {
      const raffle = client.db.getOpenRaffle(interaction.guildId);
      if (!raffle) {
        return interaction.reply({ content: 'There is no active raffle to close.', ephemeral: true });
      }

      const entries = client.db.getRaffleEntries(raffle.id);
      if (!entries.length) {
        client.db.closeRaffle(raffle.id);
        return interaction.reply({ content: 'The raffle closed with no entries.' });
      }

      const weighted = [];
      for (const entry of entries) {
        for (let i = 0; i < entry.tickets; i += 1) {
          weighted.push(entry.userId);
        }
      }
      const winnerId = weighted[Math.floor(Math.random() * weighted.length)];
      client.db.closeRaffle(raffle.id);

      return interaction.reply({ content: `🎉 The raffle is closed! <@${winnerId}> wins **${raffle.prize}**.` });
    }
  }
};
