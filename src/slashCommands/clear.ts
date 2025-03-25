import { SlashCommandBuilder, TextChannel } from "discord.js"
import { SlashCommand } from "../types"

export const command: SlashCommand = {
    name: "clear",
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Affiche le build du personnage demandé")
        .addStringOption((option) => {
            return option
                .setName("nombre")
                .setDescription("Le nombre de messages à supprimer")
                .setRequired(true)
        }),

    execute: async (interaction) => {

        // Récupère le nombre de messages à supprimer
        const amountOption = interaction.options.get("nombre")?.value as string
        const amount = parseInt(amountOption)

        if (!amount) {
            await interaction.reply("Veuillez spécifier un nombre entre 1 et 100.")
            return
        }

        // Vérifie que le nombre est valide et entre 1 et 100
        if (amount < 1 || amount > 100) {

            await interaction.reply("Veuillez spécifier un nombre entre 1 et 100.")
            return

        }

        try {

            // Supprime les messages
            await (interaction.channel as TextChannel).bulkDelete(amount, true)

            // Répondre à l'interaction pour éviter l'erreur
            await interaction.reply({ content: `Suppression de ${amount} messages.`, ephemeral: true })


        } catch (error) {

            // Répondre à l'interaction pour éviter l'erreur
            console.error("Erreur dans la suppression des messages : ", error)
            await interaction.reply({ content: "Une erreur s'est produite lors de la suppression des messages.", ephemeral: true })
            return
        }
    },
}
