const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Modifier le panel du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client) {

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
        ])
        .addOptions([
            {
                label: 'Modifier les salons de greet',
                value: 'edit_greet',
                emoji: "<:message:1359458278089687240>"
            },
        ]);
    

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({ embeds: [embed], components: [row]});
    },
};
