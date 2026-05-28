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
import {embed_claimBadge} from "../embeds/events/utils/claimBadgeEmbed";

const BADGE_ID = "n03jdk3fh6jr33c";
const ANNIVERSAIRE_DATE = "29/05"

const aujourdHui = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit'
});

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
            // On ne met pas en éphémère pour que tout le monde puisse voir la célébration
            await interaction.deferReply();

            if (aujourdHui !== ANNIVERSAIRE_DATE) {
                await interaction.editReply({
                    content: "Ah bah non c'est pas aujourd'hui l'anniversaire 🦦",
                })
            }

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

            // Récupérer les infos du badge pour l'icône
            const badge_infos = await OtterPocketBase.execByAlias<{id: string, image: string}>(
                "otr-badges-getOne",
                BADGE_ID
            );

            // Créer l'entrée dans badges_earned
            const newBadgeEarned = await OtterPocketBase.execByAlias<BadgesEarnedType>(
                "otr-badgesEarned-create",
                {
                    discord_user: utilisateur_infos.id,
                    badge: BADGE_ID,
                    date_received: new Date().toISOString()
                }
            );

            if (!newBadgeEarned) {
                await interaction.editReply({
                    content: "Une erreur est survenue lors de l'attribution du badge.",
                });
                return;
            }

            // Construction de l'URL de l'icône (PocketBase format)
            const pbUrl = process.env.PB_URL || "";
            const iconUrl = badge_infos?.image
                ? `${pbUrl}/api/files/badges/${badge_infos.id}/${badge_infos.image}`
                : member.displayAvatarURL();

            const embed = embed_claimBadge(member, iconUrl);

            await interaction.editReply({
                content: null,
                embeds: [embed]
            });
        } catch (error: unknown) {
            otterlogs.error("Erreur lors de la récupération du badge : " + error);
            await interaction.editReply({
                content: "Une erreur est survenue lors de l'attribution du badge. Veuillez contacter un administrateur."
            });
        }
    }
};
