import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    InteractionContextType
} from "discord.js";
import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {otterlogs} from "../../otterbots/utils/otterlogs";

export default {
    data: new SlashCommandBuilder()
        .setName("link-account")
        .setDescription("Permet la liaison d'un compte Discord avec un compte en jeu.")
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option =>
            option
                .setName("code")
                .setDescription("Votre code de liaison")
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const member = interaction.member as GuildMember | null;
        const code = interaction.options.getString("code") || null;

        if (!member) {
            await interaction.reply({
                content: "Impossible de trouver ce membre sur le serveur.",
                flags: "Ephemeral"
            });
            return;
        }

        if (!code) {
            await interaction.reply({
                content: "Veuillez fournir un code de liaison valide.",
                flags: "Ephemeral"
            });
            return;
        }

        try {
            await interaction.deferReply({flags: "Ephemeral"}); // pour gérer les réponses pouvant être un peu longues

            // On récupére les informations de l'utilisateur Discord
            const utilisateur_infos = await Otterlyapi.getDataByAlias<UtilisateursDiscordType>("otr-utilisateursDiscord-getByDiscordId", member.id)

            if (!utilisateur_infos) {
                await interaction.editReply({
                    content: "Impossible de trouver votre compte sur le serveur.",
                });
                return;
            }

            // On renvoie le code et l'id de l'utilisateur
            const response = await Otterlyapi.postDataByAlias(
                "otr-joueurs-link-account",
                { code, utilisateur_id: utilisateur_infos.id }
            );

            if (!response) {
                await interaction.editReply({
                    content: "Le code de liaison est invalide ou a déjà été utilisé.",
                });
                return;
            }

            await interaction.editReply({
                content: "La liaison avec votre compte a bien été effectué.",
            });
        } catch (error: unknown) {
            otterlogs.error("Erreur lors de la liaison du compte : " + error)
            await interaction.editReply({
                content: "Une erreur est survenue lors de la liaison du compte merci de contacter un administrateur."
            })
        }





    }
};
