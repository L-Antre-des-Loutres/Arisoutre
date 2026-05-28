import {EmbedBuilder, GuildMember} from "discord.js";

/**
 * Generates an embed for claiming the birthday badge.
 *
 * @param {GuildMember} member - The member claiming the badge.
 * @param {string} badgeIconUrl - The URL of the badge icon.
 * @return {EmbedBuilder} - The constructed embed.
 */
export function embed_claimBadge(member: GuildMember, badgeIconUrl: string): EmbedBuilder {
    return new EmbedBuilder()
        .setColor("#FFD700") // Gold color for celebration
        .setAuthor({
            name: member.displayName,
            iconURL: member.displayAvatarURL()
        })
        .setTitle("🎂 Joyeux Anniversaire !")
        .setDescription(`${member} souhaite un joyeux anniversaire à **l'Antre des Loutres** ! 🎉`)
        .setThumbnail(badgeIconUrl)
        .addFields({
            name: "Badge Obtenu",
            value: "Vous avez reçu le badge spécial d'anniversaire ! Merci de faire partie de la communauté. 🦦"
        })
        .setFooter({text: `${process.env.BOT_NAME} • Anniversaire`})
        .setTimestamp();
}
