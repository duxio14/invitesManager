const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('📜 Voir les statistiques d’invitation du serveur ou d’un membre')
    .addUserOption(option =>
      option
        .setName('membre')
        .setDescription('Le membre dont vous voulez voir les invitations')
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const target = interaction.options.getUser('membre') || interaction.user;

    const inviteData = await client.models.invites.findOne({
      where: {
        guildId: interaction.guild.id,
        userId: target.id,
      },
    });

    const total = inviteData?.total || 0;
    const fake = inviteData?.fake || 0;
    const real = total - fake;

    const plural = (count, singular, plural) => count === 1 ? singular : plural;

    const invites = await interaction.guild.invites.fetch();
    const userInvites = invites.filter(invite => invite.inviter?.id === target.id);
    const topInvite = userInvites.sort((a, b) => (b.uses || 0) - (a.uses || 0)).first();

    const embed = new EmbedBuilder()
      .setTitle(`Invitations de ${target.tag}`)
      .setColor('#2b2d31')
      .setDescription(
        `> 👥 **${plural(real, 'Invitation', 'Invitations')}** : \`${real}\`\n` +
        `> ✅ **${plural(total, 'Join', 'Joins')}** : \`${total}\`\n` +
        `> ❌ **${plural(fake, 'Fake', 'Fakes')}** : \`${fake}\`` +
        (topInvite ? `\n\n🔗 **Lien le plus utilisé** : [${topInvite.code}](https://discord.gg/${topInvite.code}) (\`${topInvite.uses} utilisations\`)` : '')
      )
      .setFooter({ 
        text: `${target.tag}`, 
        iconURL: target.displayAvatarURL() 
      });

      
    const detailButton = new ButtonBuilder()
    .setCustomId('detail')
    .setLabel('Détail')
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(detailButton);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
