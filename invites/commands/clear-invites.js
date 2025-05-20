const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearinvites')
    .setDescription('\`🗑️\` Supprime toutes les invitations avec moins de X utilisations')
    .addIntegerOption(option =>
      option.setName('uses')
      .setDescription("Le nombre d'utilisation(s)")
        .setMinValue(0)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ephemeral: true});
    const threshold = interaction.options.getInteger('uses') ?? 1;

    try {
      const invites = await interaction.guild.invites.fetch();

      const invitesToDelete = invites.filter(invite => invite.uses < threshold);

      if (invitesToDelete.size === 0) {
        return interaction.editReply({ content: `Aucune invitation avec moins de ${threshold} utilisation(s) trouvée.`, ephemeral: true });
      }

      let deletedCount = 0;
      for (const invite of invitesToDelete.values()) {
        await invite.delete(`Supprimée via /clearinvites car < ${threshold} utilisations`);
        deletedCount++;
      }

      return interaction.editReply({ content: `✅ ${deletedCount} invitation(s) supprimée(s) avec moins de ${threshold} utilisation(s).`, ephemeral: true });

    } catch (err) {
      console.error('Erreur lors de la suppression des invitations :', err);
      return interaction.editReply({ content: '❌ Une erreur est survenue lors de la suppression des invitations.', ephemeral: true });
    }
  }
};
