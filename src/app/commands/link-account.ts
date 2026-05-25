import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    InteractionContextType
} from "discord.js";
import {OtterPocketBase} from "../../otterbots/utils/pocketbase/pocketbase";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {LinkingCodeType} from "../types/LinkingCodeType";
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
            const utilisateur_infos = await OtterPocketBase.execByAlias<UtilisateursDiscordType>("otr-utilisateursDiscord-getByDiscordId", `discord_id="${member.id}"`);

            if (!utilisateur_infos) {
                await interaction.editReply({
                    content: "Impossible de trouver votre compte sur le serveur.",
                });
                return;
            }

            // On récupère le code de liaison
            const linking_data = await OtterPocketBase.execByAlias<LinkingCodeType>(
                "otr-linkingCode-getByCode",
                `linking_code="${code}"`
            );

            if (!linking_data || (linking_data.used_at && linking_data.used_at !== "")) {
                await interaction.editReply({
                    content: "Le code de liaison est invalide ou a déjà été utilisé.",
                });
                return;
            }

            // On met à jour le joueur avec l'id de l'utilisateur Discord
            const update_player = await OtterPocketBase.execByAlias(
                "otr-players-update",
                linking_data.player,
                { discord_user: utilisateur_infos.id }
            );

            if (!update_player) {
                await interaction.editReply({
                    content: "Une erreur est survenue lors de la mise à jour de votre compte joueur.",
                });
                return;
            }

            // On marque le code comme utilisé
            await OtterPocketBase.execByAlias("otr-linkingCode-update", linking_data.id, {
                used_at: new Date().toISOString()
            });

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

