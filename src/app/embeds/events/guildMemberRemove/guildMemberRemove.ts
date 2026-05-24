import {EmbedBuilder} from "discord.js";
import {UtilisateursDiscordType} from "../../../types/UtilisateursDiscordType";

export async function embed_guildMemberRemove(
    utilisateursDiscord?: UtilisateursDiscordType
): Promise<EmbedBuilder> {
    const pseudo = utilisateursDiscord?.username ?? "Loutre disparue";
    const avatar = utilisateursDiscord?.avatar_url ?? null;
    const joinDate = utilisateursDiscord?.joined_at
        ? `<t:${Math.floor(new Date(utilisateursDiscord.joined_at).getTime() / 1000)}:R>`
        : "Date inconnue";

    return new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({
            name: utilisateursDiscord?.username ?? "Loutre disparue",
            iconURL: utilisateursDiscord?.avatar_url ?? ""
        })
        .setTitle("Une loutre quitte l’antre...")
        .setDescription([
            `${pseudo} a quitté notre clan...`,
            "Portée par le courant, elle nage désormais vers d’autres eaux. 🌊",
        ].join("\n"))
        .addFields(
            {
                name: "📅 Rejoint le serveur",
                value: joinDate,
                inline: false
            },
            {
                name: "📝 Nombre de messages",
                value: "Non disponible",
                inline: true
            },
            {
                name: "🎤 Temps en vocal",
                value: "Non disponible",
                inline: true
            }
        )
        .setThumbnail(avatar)
        .setFooter({ text: "L’antre se souviendra de toi..." })
        .setTimestamp();
}