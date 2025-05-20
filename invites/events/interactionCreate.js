const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } = require("discord.js");
const basedMsg = "{user.tag} nous a rejoint. Il a été invité par {inviter.username} qui a maintenant {inviter.invites} invitations.";
const correctedText = require("../utils/correction");

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isStringSelectMenu) {
      if (interaction.customId === 'panel-select') {
        const selected = interaction.values[0];

        if (selected === 'edit_logs_channel') {

          const config = await client.models.config.findOne({ where: { guildId: interaction.guild.id } });

          await interaction.update({
            embeds: [
              {
                description: config && config.logsId ? `\`\`\`python\nSalon de logs : <#${config.logsId}>\`\`\`` : "Aucun salon définie."
              }
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId('back')
                  .setEmoji('<:back:1359471884701532271>')
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId('-------')
                  .setEmoji('❤️')
                  .setDisabled(true)
                  .setStyle(ButtonStyle.Secondary),
              ),
              new ActionRowBuilder().addComponents(
                new ChannelSelectMenuBuilder()
                  .setCustomId('choose-log-channel')
                  .setPlaceholder('Salon de logs')
                  .addChannelTypes(ChannelType.GuildText)
              )
            ]
          });
        } else if (selected === 'edit_msg') {
          const config = await client.models.config.findOne({ where: { guildId: interaction.guild.id } });

          await interaction.update({
            embeds: [
              {
                description: `\`\`\`python\nMessage : ${config && config.msg ? config.msg : basedMsg}\`\`\`` + "\n"
                  + "\n\`{user}\` - *Le nouveau membre* - {user.id, user.tag, user.username}"
                  + "\n\`{inviter}\` - *L'inviteur* - {inviter.id, inviter.tag, inviter.username, inviter.invites}"
                  + "\n\`{guild}\` - *Le serveur* - {guild.id, guild.name, guild.memberCount}"
              }
            ],
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId('back')
                  .setEmoji('<:back:1359471884701532271>')
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId('-------')
                  .setEmoji('❤️')
                  .setDisabled(true)
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId('choose-msg')
                  .setLabel('Modifier')
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId('test-msg')
                  .setLabel('Tester')
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId('correct')
                  .setLabel('Corriger')
                  .setStyle(ButtonStyle.Secondary),

              )
            ]
          });
         } else if (selected === 'edit_greet') {
            const greet = await client.models.greet.findOne({ where: { guildId: interaction.guild.id } });
          
            // Récupérer les salons configurés (channelIds)
            const currentChannelIds = greet && greet.channelIds ? JSON.parse(greet.channelIds) : [];
          
            // Construire la description du message
            let channelsDescription = currentChannelIds.length > 0
              ? currentChannelIds.map(id => `${id}`).join('\n')
              : "Aucun salon configuré";
          
            // Afficher l'embed avec la liste des salons et les boutons
            await interaction.update({
              embeds: [
                {
                  description: `\`\`\`python\nMessage : ${channelsDescription}\`\`\`\n`
                }
              ],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId('back')
                    .setEmoji('<:back:1359471884701532271>')
                    .setStyle(ButtonStyle.Secondary),
                  new ButtonBuilder()
                    .setCustomId('-------')
                    .setEmoji('❤️')
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),
                  new ButtonBuilder()
                    .setCustomId('gregergege')
                    .setLabel('Supprimer')
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),
                  new ButtonBuilder()
                    .setCustomId('test-msg')
                    .setLabel('Ajouter')
                    .setDisabled(true)
                    .setStyle(ButtonStyle.Secondary),
                )
              ]
            });
          }
          
      }
    }
    if (interaction.customId === 'choose-log-channel') {

      const selectedChannel = interaction.guild.channels.cache.get(interaction.values[0]);

      await client.models.config.upsert({
        guildId: interaction.guild.id,
        logsId: selectedChannel.id,
      });

      await interaction.update({
        embeds: [
          {
            description: `\`\`\`python\nSalon de logs : ${selectedChannel.name}\`\`\``
          }
        ],
      });
    } else if (interaction.customId === 'choose-msg') {

      const msg = await interaction.reply({
        content: 'Veuillez envoyer le message que vous souhaitez définir. *<cancel> pour annuler*',
        ephemeral: true
      });

      const filter = (message) => message.author.id === interaction.user.id && message.channel.id === interaction.channel.id;
      const collector = interaction.channel.createMessageCollector({
        filter,
        time: 60000 * 5,
        max: 1
      });

      collector.on('collect', async (message) => {

        await msg.delete();
        await message.delete();
        if (message.content === "cancel") return collector.stop();

        await client.models.config.upsert({
          guildId: interaction.guild.id,
          msg: message.content,
        });
        await interaction.message.edit({
          embeds: [
            {
              description: `\`\`\`python\nMessage : ${message.content}\`\`\`` + "\n"
                + "\n\`{user}\` - *Le nouveau membre* - {user.id, user.tag, user.username}"
                + "\n\`{inviter}\` - *L'inviteur* - {inviter.id, inviter.tag, inviter.username, inviter.invites}"
                + "\n\`{guild}\` - *Le serveur* - {guild.id, guild.name, guild.memberCount}"
            }
          ]
        })
      });

      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          interaction.followUp({
            content: 'Le temps est écoulé, aucune réponse reçue.',
            ephemeral: true
          });
        }
      });
    } else if (interaction.customId === 'test-msg') {

      await interaction.deferUpdate();
      const config = await client.models.config.findOne({ where: { guildId: interaction.guild.id } });
      let msg = basedMsg;
      if (config && config.msg) {
        msg = config.msg
      };

      const guild = interaction.guild;
      const user = interaction.user;
      const inviter = client.users.cache.random();

      const message = await interaction.channel.send(msg.replace(/{user}/g, "<@" + user.id + ">")
        .replace(/{user.id}/g, user.id)
        .replace(/{user.tag}/g, user.tag)
        .replace(/{inviter}/g, inviter.username)
        .replace(/{inviter.id}/g, inviter.id)
        .replace(/{inviter.tag}/g, inviter.tag)
        .replace(/{inviter.username}/g, inviter.username)
        .replace(/{inviter.invites}/g, "7")
        .replace(/{guild}/g, guild.name)
        .replace(/{guild.id}/g, guild.id)
        .replace(/{guild.memberCount}/g, guild.memberCount))

      setTimeout(() => {
        return message.delete();
      }, 10000)
    } else if (interaction.customId === 'correct') {
      const config = await client.models.config.findOne({ where: { guildId: interaction.guild.id } });
      if (config && config.msg) {
        const correction = await correctedText(config.msg);
        await interaction.reply({
          content: `Texte corrigé : ${correction}\n\n*Ceci est en cours de développement (c'est pour toi tealy)*`,
          ephemeral: true
        })
      } else {
        await interaction.reply({
          content: "Il n'y a aucune faute.",
          ephemeral: true
        })
      }
    } else if (interaction.customId === 'back') {


      const embed = new EmbedBuilder()
        .setTitle("🎛️ Panneau de gestion des invitations")
        .setDescription("Choisissez une option dans le menu déroulant ci-dessous.")
        .setColor("#2b2d31");

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('panel-select')
        .setPlaceholder('Choisir une option')
        .addOptions([
          {
            label: 'Modifier le salon de logs',
            value: 'edit_logs_channel',
            emoji: "<:edit:1359446741312737330>"
          },
        ])
        .addOptions([
          {
            label: 'Modifier le message d\'invitation',
            value: 'edit_msg',
            emoji: "<:message:1359458278089687240>"
          },
        ]);


      const row = new ActionRowBuilder().addComponents(selectMenu);
      await interaction.update({
        embeds: [embed],
        components: [row]
      })
    } else if (interaction.customId === 'detail') {
      const target = interaction.user;

      const inviteHistory = await client.models.history.findAll({
        where: {
          guildId: interaction.guild.id,
          invitorId: target.id,
        },
        order: [['createdAt', 'DESC']],
      });

      const invites = await interaction.guild.invites.fetch();

      const topInvites = invites.sort((a, b) => b.uses - a.uses).first(10);

      const dayCounts = {};
      inviteHistory.forEach(entry => {
        const day = entry.createdAt.toDateString();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });

      const topDay = Object.entries(dayCounts).reduce((max, entry) => entry[1] > max[1] ? entry : max, ['', 0]);

      let inv = [];

      topInvites.forEach((invite, index) => {
        inv.push({
          code: invite.code,
          uses: invite.uses
        })
      });
      const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
      const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

      const date = new Date(topDay[0]);
      const formattedDate = `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

      const inviteHistoryEmbed = new EmbedBuilder()
        .setTitle(`Détails`)
        .setColor('#2b2d31')
        .setDescription(`> ${inv.map(x => `\`${x.code}\` ➔ **${x.uses}**`).join("\n> ")}\n\n**Meilleur jour** ➔ *${formattedDate}* : \`${topDay[1]}\` invitations`)
        .setFooter({
          text: `${target.tag}`,
          iconURL: target.displayAvatarURL()
        });

      await interaction.update({ embeds: [inviteHistoryEmbed], components: [] });
    } 
  }
}
