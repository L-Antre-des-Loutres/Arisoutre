import {EmbedBuilder} from "discord.js";
import {UtilisateursDiscordType} from "../../../types/UtilisateursDiscordType";

export async function embed_guildMemberRemove(
    utilisateursDiscord?: UtilisateursDiscordType
): Promise<EmbedBuilder> {
    const pseudo = utilisateursDiscord?.pseudo_discord ?? "Loutre disparue";
    const avatar = utilisateursDiscord?.avatar_url ?? null;
    const joinDate = utilisateursDiscord?.join_date_discord
        ? `<t:${Math.floor(new Date(utilisateursDiscord.join_date_discord).getTime() / 1000)}:R>`
        : "Date inconnue";

    return new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({
            name: utilisateursDiscord?.pseudo_discord ?? "Loutre disparue",
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
                value: utilisateursDiscord?.nb_message?.toString() ?? "0",
                inline: true
            },
            {
                name: "🎤 Temps en vocal",
                value: utilisateursDiscord?.vocal_time?.toString() ?? "0",
                inline: true
            }
        )
        .setThumbnail(avatar)
        .setFooter({ text: "L’antre se souviendra de toi..." })
        .setTimestamp();
}