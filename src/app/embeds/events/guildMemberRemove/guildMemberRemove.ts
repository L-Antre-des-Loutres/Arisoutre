import {EmbedBuilder} from "discord.js";
import {UtilisateursDiscordType} from "../../../types/UtilisateursDiscordType";

export async function embed_guildMemberRemove(
    utilisateursDiscord?: UtilisateursDiscordType,
    actionType: 'leave' | 'kick' | 'ban' = 'leave',
    executorName?: string,
    messageCount: number = 0,
    vocalTime: number = 0,
    reason?: string
): Promise<EmbedBuilder> {
    const pseudo = utilisateursDiscord?.username ?? "Loutre disparue";
    const avatar = utilisateursDiscord?.avatar_url ?? null;
    const joinDate = utilisateursDiscord?.joined_at
        ? `<t:${Math.floor(new Date(utilisateursDiscord.joined_at).getTime() / 1000)}:R>`
        : "Date inconnue";

    let title = "Une loutre quitte l’antre...";
    let description = [
        `${pseudo} a quitté notre clan...`,
        "Portée par le courant, elle nage désormais vers d’autres eaux. 🌊",
    ].join("\n");
    let color = 0x5865f2; // Blurple

    if (actionType === 'ban') {
        title = "🔴 Loutre bannie de l'antre !";
        description = [
            `${pseudo} a été banni(e) de l'antre.`,
            `L'action a été effectuée par **${executorName ?? "un modérateur"}**. 🔨`,
            reason ? `**Raison :** ${reason}` : ""
        ].filter(line => line !== "").join("\n");
        color = 0xED4245; // Red
    } else if (actionType === 'kick') {
        title = "🟠 Loutre expulsée de l'antre !";
        description = [
            `${pseudo} a été expulsé(e) de l'antre.`,
            `L'action a été effectuée par **${executorName ?? "un modérateur"}**. 👢`,
            reason ? `**Raison :** ${reason}` : ""
        ].filter(line => line !== "").join("\n");
        color = 0xFEE75C; // Yellow
    }

    // Formatage du temps vocal (vocalTime est en heures décimales)
    const hours = Math.floor(vocalTime);
    const minutes = Math.round((vocalTime - hours) * 60);
    const vocalDisplay = hours > 0 
        ? `${hours}h ${minutes}m` 
        : `${minutes}m`;

    return new EmbedBuilder()
        .setColor(color)
        .setAuthor({
            name: utilisateursDiscord?.username ?? "Loutre disparue",
            iconURL: utilisateursDiscord?.avatar_url ?? ""
        })
        .setTitle(title)
        .setDescription(description)
        .addFields(
            {
                name: "📅 Rejoint le serveur",
                value: joinDate,
                inline: false
            },
            {
                name: "📝 Nombre de messages",
                value: messageCount.toString(),
                inline: true
            },
            {
                name: "🎤 Temps en vocal",
                value: vocalDisplay,
                inline: true
            }
        )
        .setThumbnail(avatar)
        .setFooter({ text: actionType === 'leave' ? "L’antre se souviendra de toi..." : "La sentence est tombée." })
        .setTimestamp();
}