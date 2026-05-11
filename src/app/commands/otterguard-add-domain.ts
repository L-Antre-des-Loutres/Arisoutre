import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    PermissionFlagsBits,
    InteractionContextType
} from "discord.js";
import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {fetchAuthorizedDomains} from "../tasks/fetchAuthorizedDomains";

/**
 * Command to add an authorized domain to Otterguard.
 * It sends a POST request to the API and refreshes the local authorized domains cache.
 */
export default {
    data: new SlashCommandBuilder()
        .setName("otterguard-add-domain")
        .setDescription("Ajoute un domaine autorisé à Otterguard.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option
                .setName("domaine")
                .setDescription("L'URL du domaine à autoriser (ex: https://example.com)")
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const domain = interaction.options.getString("domaine", true);

        try {
            await interaction.deferReply({flags: "Ephemeral"});

            // On ajoute le domaine via l'API (POST)
            // Utilisation de l'alias "otr-otterguard-create" qui correspond à l'ID 6002
            const response = await Otterlyapi.postDataByAlias(
                "otr-otterguard-create",
                { domain_url: domain }
            );

            if (!response) {
                await interaction.editReply({
                    content: "❌ Une erreur est survenue lors de l'ajout du domaine via l'API. Vérifiez que le domaine n'existe pas déjà.",
                });
                return;
            }

            // On rafraîchit le fichier JSON local (authorizedDomains.json)
            // Cela utilise l'alias "otr-otterguard-getAll" (ID 6000) mentionné par l'utilisateur
            await fetchAuthorizedDomains();

            await interaction.editReply({
                content: `✅ Le domaine **${domain}** a bien été ajouté aux domaines autorisés et le cache local a été mis à jour.`,
            });
        } catch (error: unknown) {
            otterlogs.error("Erreur lors de l'ajout du domaine : " + error)
            await interaction.editReply({
                content: "❌ Une erreur est survenue lors de l'ajout du domaine."
            })
        }
    }
};
