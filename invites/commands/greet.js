const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('greet')
    .setDescription('Gère les salons de bienvenue pour ce serveur.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Ajoute ce salon à la liste des salons de bienvenue')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Supprime ce salon de la liste des salons de bienvenue')
    ),

  async execute(interaction) {
    const { client, channel, guild } = interaction;

    try {
      // Vérifier si la guilde a déjà une entrée dans la base de données
      const existing = await client.models.greet.findOne({
        where: { guildId: guild.id }
      });

      // Si la guilde n'a pas d'entrées, en créer une nouvelle
      // if (!existing) {
      //   await client.models.greet.create({
      //     guildId: guild.id,
      //     channelIds: JSON.stringify([])  // Créer un tableau vide si aucun salon n'existe
      //   });
      // }

      // Vérifier si channelIds est une chaîne valide
      let currentChannelIds = [];
      try {
        currentChannelIds = JSON.parse(existing.channelIds);

        // Assurer que currentChannelIds est un tableau
        if (!Array.isArray(currentChannelIds)) {
          throw new Error('channelIds ne devrait pas être un objet ou un nombre');
        }
      } catch (error) {
        currentChannelIds = [];
      }

      // Vérifier si la sous-commande est "add" ou "remove"
      if (interaction.options.getSubcommand() === 'add') {
        // Vérifier si le salon est déjà dans la liste
        if (currentChannelIds.includes(channel.id)) {
          await interaction.reply({
            content: `❌ Ce salon est déjà défini comme salon de bienvenue.`,
            ephemeral: true
          });
          return;
        }

        // Vérifier le nombre de salons de bienvenue déjà définis
        if (currentChannelIds.length >= 3) {
          await interaction.reply({
            content: `❌ Vous avez déjà 3 salons de bienvenue définis pour ce serveur.`,
            ephemeral: true
          });
          return;
        }

        // Ajouter le salon actuel à la liste des salons
        currentChannelIds.push(channel.id);
        if (!existing) {
        await client.models.greet.create({
          guildId: guild.id,
          channelIds: JSON.stringify(currentChannelIds)  // Créer un tableau vide si aucun salon n'existe
        });
      } else {
        existing.channelIds = JSON.stringify(currentChannelIds);
        await existing.save();

      }
       
        await interaction.reply({
          content: `✅ Le salon de bienvenue a été ajouté ici : <#${channel.id}>`,
          ephemeral: true
        });
      }

      if (interaction.options.getSubcommand() === 'remove') {
        // Vérifier si le salon est dans la liste
        if (!currentChannelIds.includes(channel.id)) {
          await interaction.reply({
            content: `❌ Ce salon n'est pas défini comme salon de bienvenue.`,
            ephemeral: true
          });
          return;
        }

        // Supprimer le salon actuel de la liste
        currentChannelIds = currentChannelIds.filter(id => id !== channel.id);
        existing.channelIds = JSON.stringify(currentChannelIds);
        await existing.save();

        await interaction.reply({
          content: `✅ Le salon de bienvenue a été supprimé ici : <#${channel.id}>`,
          ephemeral: true
        });
      }
    } catch (err) {
      console.error('Erreur création ou mise à jour d\'entrée greet:', err);
      await interaction.reply({
        content: `❌ Une erreur est survenue.`,
        ephemeral: true
      });
    }
  }
};
