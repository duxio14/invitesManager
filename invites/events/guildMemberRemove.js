module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {

        const user = await client.models.history.findOne({ where: { guildId: member.guild.id, userId: member.id } });
        console.log(user)

        if (user) {
            console.log(user.invitorId);

            const inviteData = await client.models.invites.findOne({
                where: { userId: user.invitorId, guildId: member.guild.id }
            });

            if (inviteData) {
                inviteData.fake++;
                await inviteData.save();
            } else {
                console.warn(`Aucune donnée d'invitation trouvée pour l'utilisateur ${user.invitorId} dans la guilde ${member.guild.id}`);
            }
        }
    }
};
