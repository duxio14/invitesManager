module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    try {
      const newInvites = await member.guild.invites.fetch();
      const invites = client.invites;
      const oldInvites = invites.get(member.guild.id) || new Map();

      invites.set(member.guild.id, new Map(newInvites.map(inv => [inv.code, inv.uses])));

      const usedInvite = newInvites.find(inv => oldInvites.get(inv.code) < inv.uses);

      let inviter = null;
      let joinedViaVanity = false;

      const guild = member.guild;
      if (guild.features.includes('VANITY_URL')) {
        const vanityData = await guild.fetchVanityData().catch(() => null);

        if (vanityData && !usedInvite) {
          joinedViaVanity = true;
        }
      }

      if (usedInvite && usedInvite.inviter) {
        inviter = usedInvite.inviter;

        const alreadyExists = await client.models.history.findOne({
          where: {
            userId: member.id,
            guildId: member.guild.id
          }
        });

        if (alreadyExists == null) {
          await client.models.history.create({
            userId: member.id,
            invitorId: inviter.id,
            guildId: member.guild.id
          });

          const [inviteData] = await client.models.invites.findOrCreate({
            where: { userId: inviter.id, guildId: member.guild.id }
          });

          inviteData.total++;
          inviteData.real++;
          await inviteData.save();
        } else {
          const [inviteData] = await client.models.invites.findOrCreate({
            where: { userId: inviter.id, guildId: member.guild.id }
          });
          inviteData.fake--;
          await inviteData.save();
        }
      }

      // Récupérer la configuration du message personnalisé et les salons de bienvenue
      const config = await client.models.config.findOne({ where: { guildId: member.guild.id } });
      if (!config) return;

      let parsedMsg;

      if (joinedViaVanity) {
        // Message pour les utilisateurs ayant rejoint via l'URL d'invitation personnalisée
        parsedMsg = `${member.user.username} a rejoint via l'URL d'invitation personnalisée du serveur.`;
      } else {
        const msgTemplate = config.msg || '{user} a rejoint le serveur. Invité par {inviter}.';
        const inviterData = inviter
          ? await client.models.invites.findOne({
              where: { userId: inviter.id, guildId: member.guild.id }
            })
          : null;

        parsedMsg = msgTemplate
          .replace(/{user}/g, `<@${member.id}>`)
          .replace(/{user.username}/g, member.user.username)
          .replace(/{user.tag}/g, member.user.tag)
          .replace(/{user.id}/g, member.id)
          .replace(/{inviter}/g, inviter ? `<@${inviter.id}>` : 'quelqu\'un')
          .replace(/{inviter.username}/g, inviter?.username || 'inconnu')
          .replace(/{inviter.tag}/g, inviter?.tag || 'inconnu')
          .replace(/{inviter.id}/g, inviter?.id || 'inconnu')
          .replace(/{inviter.invites}/g, inviterData?.real?.toString() || '0')
          .replace(/{guild.name}/g, member.guild.name)
          .replace(/{guild.id}/g, member.guild.id)
          .replace(/{guild.memberCount}/g, member.guild.memberCount.toString());
      }

      // Récupérer les salons de bienvenue du serveur depuis la BDD
      const greetData = await client.models.greet.findOne({
        where: { guildId: member.guild.id }
      });

      if (greetData) {
        const channelIds = JSON.parse(greetData.channelIds); // Récupérer les salons de bienvenue
        for (const channelId of channelIds) {
          const channel = member.guild.channels.cache.get(channelId);
          if (channel && channel.isTextBased()) {
            channel.send({ content: "<@" + member.id + ">" }).then(async (msg) => {
              setTimeout(() => {
                msg.delete()
              }, 5000)
              
            })
          }
        }
      }

      // Envoie dans le salon de logs
      const logChannel = member.guild.channels.cache.get(config.logsId);
      if (logChannel?.isTextBased()) {
        logChannel.send({ content: parsedMsg });
      }

    } catch (error) {
      console.error('Erreur dans guildMemberAdd :', error);
    }
  }
};
