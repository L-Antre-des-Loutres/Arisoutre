import {Events, Message} from "discord.js";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {OtterPocketBase} from "../../otterbots/utils/pocketbase/pocketbase";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {BadgesEarnedType} from "../types/BadgesEarnedType";
import {embed_claimBadge} from "../embeds/events/utils/claimBadgeEmbed";

const ANNIVERSAIRE_DATE = "29/05";
const BADGE_ID = "n03jdk3fh6jr33c";

/**
 * Returns the current date formatted as DD/MM.
 */
function getAujourdHui(): string {
    return new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
    });
}

module.exports =  {
    name: Events.MessageCreate,
    once: false,

    async execute(message: Message): Promise<void> {

        try {
            // Pas de bot
            if (message.author.bot) return;

            // Uniquement sur serveur
            if (!message.guild) return;

            // Vérifier la date
            if (getAujourdHui() !== ANNIVERSAIRE_DATE) return;

            // Vérifier le contenu du message (insensible à la casse et aux accents de base)
            const content = message.content.toLowerCase();
            const keywords = ["joyeux anniversaire", "bon anniversaire", "hbd"];
            
            const matches = keywords.some(keyword => content.includes(keyword));

            if (!matches) return;

            const member = message.member ?? await message.guild.members.fetch(message.author.id);

            // --- Logique d'attribution du badge ---
            
            // Récupérer l'utilisateur Discord dans PocketBase
            const utilisateur_infos = await OtterPocketBase.execByAlias<UtilisateursDiscordType>(
                "otr-utilisateursDiscord-getByDiscordId",
                `discord_id="${member.id}"`
            );

            if (!utilisateur_infos) return;

            // Vérifier si le badge est déjà possédé
            const alreadyEarned = await OtterPocketBase.execByAlias<BadgesEarnedType>(
                "otr-badgesEarned-getByUserAndBadge",
                `discord_user="${utilisateur_infos.id}" && badge="${BADGE_ID}"`
            );

            if (alreadyEarned) return;

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

            if (!newBadgeEarned) return;

            // Construction de l'URL de l'icône (PocketBase format)
            const pbUrl = process.env.PB_URL || "";
            const iconUrl = badge_infos?.image
                ? `${pbUrl}/api/files/badges/${badge_infos.id}/${badge_infos.image}`
                : member.displayAvatarURL();

            const embed = embed_claimBadge(member, iconUrl);

            // Succès: on envoie le message en MP pour qu'il soit privé
            try {
                await member.send({
                    embeds: [embed]
                });
            } catch (dmError) {
                otterlogs.warn(`Impossible d'envoyer le badge en MP à ${member.user.tag} (DMs fermés) : ${dmError}`);
            }

        } catch (error: unknown) {
            otterlogs.error("Erreur dans l'event AnniversaireMessage : " + error);
        }
    }
};
