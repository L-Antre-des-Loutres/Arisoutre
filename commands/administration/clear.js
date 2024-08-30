const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Efface les messages.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('quantite')
                .setDescription('Le nombre de message à supprimer')
                .setRequired(true)),
    async execute(interaction) {
        
        // Récupère le nombre de messages à supprimer
        const amount = interaction.options.getString('quantite');
        
        // Vérifie que le nombre est valide et entre 1 et 100
        if (isNaN(amount) || amount < 1 || amount > 100) {

            return interaction.reply('Veuillez spécifier un nombre entre 1 et 100.');
        
        }
        
        try {

            // Supprime les messages
            await interaction.channel.bulkDelete(parseInt(amount));  // +1 to also delete the command itself

            // Répondre à l'interaction pour éviter l'erreur
            await interaction.reply({ content: `Supprimé ${amount} messages.`, ephemeral: true });

        } catch (error) {

            // Répondre à l'interaction pour éviter l'erreur
            console.error('Erreur dans la suppresion des messages : ', error);

            // Répondre à l'interaction pour éviter l'erreur
            await interaction.reply({content:'Une erreur s\'est produite lors de la suppression des messages.', ephemeral: true});

        }
    },
};