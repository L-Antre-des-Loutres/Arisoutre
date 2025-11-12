import {EmbedBuilder, GuildMember} from "discord.js";
import {analyzeMember} from "../../../utils/moderation/analyzeMember";

/**
 * Generates an embedded analysis report for a provided member.
 * This analysis includes user information, reliability score, and any related notes or observations.
 *
 * @param {GuildMember} member - The guild member whose data will be analyzed and embedded.
 * @return {Promise<EmbedBuilder>} - A Promise that resolves to an EmbedBuilder containing the analysis details.
 */
export async function embed_analyze(member: GuildMember): Promise<EmbedBuilder> {
    // Variables de l'embed
    const user = member.user;
    const { score, verdict, color, notes } = analyzeMember(member);
    const baremeLink = "https://wiki.antredesloutres.fr/fr/doc-technique/bots-discord/arisoutre";

    // Construction de l'embed
    return new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: user.tag,
            iconURL: user.displayAvatarURL()
        })
        .setTitle(verdict)
        .setDescription([
            `**Utilisateur:** ${user} ${user.username}`,
            `**Compte créé:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
            `**Arrivé sur le serveur:** <t:${Math.floor((member.joinedTimestamp ?? 0) / 1000)}:R>`,
            `**Score de fiabilité:** ${score}/100`,
            `[Voir le barème](${baremeLink})`

        ].join("\n"))
        .addFields({
            name: "📊 Rapport d'analyse: ",
                value: (notes.length ? "• " + notes.join("\n• ") : "Aucun problème détecté ✅")
        })
        .setThumbnail(user.displayAvatarURL())
        .setFooter({text: `${process.env.BOT_NAME} • Analyse de membre`})
        .setTimestamp();
}
