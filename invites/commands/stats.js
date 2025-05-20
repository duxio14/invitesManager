const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas'); // Pour générer les graphiques
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Affiche les statistiques avancées des invitations pour l\'ensemble du serveur'),

  async execute(interaction, client) {
    try {
      // Récupérer toutes les invitations du serveur
      const invites = await interaction.guild.invites.fetch();

      // Récupérer les données d'invitations de la base de données pour ce serveur
      const inviteData = await client.models.invites.findAll({
        where: { guildId: interaction.guild.id }
      });

      let totalInvites = 0;
      let totalReal = 0;
      let totalFake = 0;
      let inviteHistory = [];
      let dates = [];
      let realInvites = [];

      // Calcul des statistiques globales
      inviteData.forEach(data => {
        totalInvites += data.total;
        totalReal += data.total - data.fake;
        totalFake += data.fake;
        inviteHistory.push({
          user: data.userId,
          total: data.total,
          real: data.total - data.fake,
          fake: data.fake,
          date: new Date(data.createdAt).toLocaleDateString() // Enregistrer la date d'ajout
        });

        // Préparer les données pour le graphique
        if (!dates.includes(new Date(data.createdAt).toLocaleDateString())) {
          dates.push(new Date(data.createdAt).toLocaleDateString());
          realInvites.push(data.total - data.fake); // Ajout des invitations réelles par date
        }
      });

      // Configuration du graphique
      const chartJSNodeCanvas = new ChartJSNodeCanvas({ width: 800, height: 400 });
      const configuration = {
        type: 'line',
        data: {
          labels: dates, // Les dates sur l'axe des X
          datasets: [{
            label: 'Invitations réelles',
            data: realInvites, // Nombre d'invitations réelles pour chaque date
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Nombre d\'invitations'
              }
            }
          }
        }
      };

      // Générer le graphique et l'envoyer sous forme d'image
      const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);

      // Créer l'embed avec les statistiques textuelles
      const embed = new EmbedBuilder()
        .setTitle(`Statistiques d'invitations du serveur`)
        .setColor('#2b2d31')
        .setDescription(
          `> **Invitations réelles** : \`${totalReal}\`\n` +
          `> **Joins totaux** : \`${totalInvites}\`\n` +
          `> **Leaves (fausses invitations)** : \`${totalFake}\`\n\n` +
          `> **Top 10 des invités :**\n` +
          inviteHistory.slice(0, 10).map((data, index) =>
            `> ${index + 1}. <@${data.user}> - **${data.real}** invitations réelles`
          ).join('\n')
        )
        .setFooter({ text: `Statistiques générées le ${new Date().toLocaleString()}` });

      // Répondre avec l'embed et l'image du graphique
      return interaction.reply({
        embeds: [embed],
        files: [{
          attachment: imageBuffer,
          name: 'invites_graph.png'
        }]
      });

    } catch (error) {
      console.error('Erreur lors de l\'exécution de la commande /stats :', error);
      return interaction.reply('Une erreur est survenue lors de la récupération des statistiques.');
    }
  },
};
