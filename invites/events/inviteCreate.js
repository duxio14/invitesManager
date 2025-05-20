module.exports = {
    name: 'inviteCreate',
    async execute(invite, client) {
      client.invites.get(invite.guild.id).set(invite.code, invite.uses);
      console.log(`Nouvelle invitation créée : ${invite.code} pour le serveur ${invite.guild.name}`);
    }
  };
  