import { SlashCommandBuilder, TextChannel } from "discord.js"
import { SlashCommand } from "../types"
import { errorLogs } from "../utils/message/logs/errorLogs"

export const command: SlashCommand = {
    name: "clear",
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Supprime le nombre de messages spécifié")
        .setDefaultMemberPermissions(0)
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

      
        if (!amount || amount < 1 || amount > 100) {
            await interaction.reply({ content: "Veuillez spécifier un nombre entre 1 et 100.", ephemeral: true })
            return;
        }

        const channel = interaction.channel as TextChannel;

        try {
            await interaction.deferReply({ ephemeral: true }); // Évite l'erreur d'interaction déjà reconnue

            // Récupérer les messages récents
            const messages = await channel.messages.fetch({ limit: amount });

            // Filtrer les messages trop anciens (plus de 14 jours)
            const filteredMessages = messages.filter(msg => (Date.now() - msg.createdTimestamp) < 14 * 24 * 60 * 60 * 1000)

            if (filteredMessages.size === 0) {
                await interaction.editReply({ content: "Aucun message récent à supprimer." })
                return;
            }

            // Supprime les messages valides
            await channel.bulkDelete(filteredMessages, true); // true pour permettre la suppression des messages déjà réagi

            // Confirmation
            await interaction.editReply({ content: `✅ Suppression de ${filteredMessages.size} messages.` })

        } catch (error) {
            if ((error as any).code === 10008) {
                console.error("Message introuvable pour suppression :", error);
                await interaction.editReply({ content: "Le message que vous tentez de supprimer n'est plus disponible." })
            } else {
                console.error("Erreur lors de la suppression des messages :", error);
                await interaction.editReply({ content: "❌ Une erreur s'est produite lors de la suppression des messages." })
                errorLogs("Erreur lors de la suppression des messages", `👤 tag : ${interaction.user.tag} (ID: ${interaction.user.id}) \n ${error}`, interaction.client)
            }
        }
    },
}