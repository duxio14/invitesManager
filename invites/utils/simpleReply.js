const { EmbedBuilder } = require('discord.js');

/**
 * Envoie un embed simple avec fond noir et description
 * @param {Message | CommandInteraction} interaction - Le message ou interaction à répondre
 * @param {string} description - Le texte à afficher dans l'embed
 */
module.exports = async function simpleReply(interaction, description) {
  const embed = new EmbedBuilder()
    .setColor('#2b2d31') // noir Discord
    .setDescription(description);

  if ('reply' in interaction) {
    return interaction.reply({ embeds: [embed], ephemeral: false });
  } else {
    return interaction.channel.send({ embeds: [embed] });
  }
};
