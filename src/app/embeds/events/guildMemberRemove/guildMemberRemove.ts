import {EmbedBuilder} from "discord.js";
import {UtilisateursDiscordType} from "../../../types/UtilisateursDiscordType";

export async function embed_guildMemberRemove(utilisateursDiscord: UtilisateursDiscordType | undefined): Promise<EmbedBuilder> {
    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setAuthor({
            name: utilisateursDiscord?.pseudo_discord ?? "Loutre disparue",
            iconURL: utilisateursDiscord?.avatar_url ?? undefined
        })
        .setTitle("🐾 Une loutre quitte l’antre...")
        .setDescription([
            `${user ?? "Un membre"} a quitté notre clan...`,
            "Portée par le courant, elle nage désormais vers d’autres eaux. 🌊",
            "",
            "Souhaitons-lui bon vent — même si la trahison pique un peu... 🦦💔"
        ].join("\n"))
        .addFields(
            {
                name: "📅 Rejoint le serveur",
                value: member?.joinedTimestamp
                    ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
                    : "Date inconnue"
            },
            {
                name: "🪪 Identifiant",
                value: user?.id ?? "Inconnu",
                inline: true
            }
        )
        .setThumbnail(user?.displayAvatarURL() ?? undefined)
        .setFooter({ text: "L’antre se souviendra de toi..." })
        .setTimestamp();
}