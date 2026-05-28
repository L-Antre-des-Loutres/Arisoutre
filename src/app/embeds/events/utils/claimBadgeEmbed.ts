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
        .setDescription(`${member}, vous avez reçu un badge spécial pour avoir souhaité un joyeux anniversaire à **l'Antre des Loutres** ! 🎉`)
        .setThumbnail(badgeIconUrl)
        .addFields({
            name: "Badge Obtenu",
            value: "Merci d'avoir pensé à nous ! Votre badge d'anniversaire a été ajouté à votre collection. 🦦"
        })
        .setFooter({text: `${process.env.BOT_NAME} • Anniversaire`})
        .setTimestamp();
}
