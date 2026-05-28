import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    GuildMember,
    InteractionContextType
} from "discord.js";
import {OtterPocketBase} from "../../otterbots/utils/pocketbase/pocketbase";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {BadgesEarnedType} from "../types/BadgesEarnedType";
import {otterlogs} from "../../otterbots/utils/otterlogs";

const BADGE_ID = "n03jdk3fh6jr33c";

export default {
    data: new SlashCommandBuilder()
        .setName("anniversaire")
        .setDescription("Récupérer votre badge d'anniversaire !")
        .setContexts(InteractionContextType.Guild),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const member = interaction.member as GuildMember | null;

        if (!member) {
            await interaction.reply({
                content: "Impossible de trouver ce membre sur le serveur.",
                flags: "Ephemeral"
            });
            return;
        }

        try {
            await interaction.deferReply({flags: "Ephemeral"});

            // Récupérer l'utilisateur Discord dans PocketBase
            const utilisateur_infos = await OtterPocketBase.execByAlias<UtilisateursDiscordType>(
                "otr-utilisateursDiscord-getByDiscordId",
                `discord_id="${member.id}"`
            );

            if (!utilisateur_infos) {
                await interaction.editReply({
                    content: "Votre compte n'est pas enregistré dans notre base de données.",
                });
                return;
            }

            // Vérifier si le badge est déjà possédé
            const alreadyEarned = await OtterPocketBase.execByAlias<BadgesEarnedType>(
                "otr-badgesEarned-getByUserAndBadge",
                `discord_user="${utilisateur_infos.id}" && badge="${BADGE_ID}"`
            );

            if (alreadyEarned) {
                await interaction.editReply({
                    content: "Vous possédez déjà ce badge !",
                });
                return;
            }

            // Chercher si l'utilisateur a un compte joueur lié pour enrichir l'entrée
            const player_infos = await OtterPocketBase.execByAlias<{id: string}>(
                "otr-players-getByDiscordUser",
                `discord_user="${utilisateur_infos.id}"`
            );

            // Créer l'entrée dans badges_earned
            const newBadgeEarned = await OtterPocketBase.execByAlias<BadgesEarnedType>(
                "otr-badgesEarned-create",
                {
                    discord_user: utilisateur_infos.id,
                    badge: BADGE_ID,
                    player: player_infos?.id,
                    date_received: new Date().toISOString()
                }
            );

            if (!newBadgeEarned) {
                await interaction.editReply({
                    content: "Une erreur est survenue lors de l'attribution du badge.",
                });
                return;
            }

            await interaction.editReply({
                content: "Félicitations ! Vous avez reçu votre badge.",
            });
        } catch (error: unknown) {
            otterlogs.error("Erreur lors de la récupération du badge : " + error);
            await interaction.editReply({
                content: "Une erreur est survenue lors de l'attribution du badge. Veuillez contacter un administrateur."
            });
        }
    }
};
