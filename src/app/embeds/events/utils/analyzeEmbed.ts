import {EmbedBuilder, GuildMember} from "discord.js";
import {analyzeMember} from "../../../utils/moderation/analyzeMember";

/**
 * Génère un embed de modération en se basant sur les données d’analyse.
 */
export async function analyzeEmbed(member: GuildMember): Promise<EmbedBuilder> {
    const user = member.user;
    const { score, verdict, color, notes } = analyzeMember(member);

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
            `**Score de fiabilité:** ${score}/100`
        ].join("\n"))
        .addFields({
            name: "📊 Analyse",
            value: notes.length ? "• " + notes.join("\n• ") : "Aucun problème détecté ✅"
        })
        .setThumbnail(user.displayAvatarURL())
        .setFooter({text: `${process.env.BOT_NAME} • Analyse de membre`})
        .setTimestamp();
}
