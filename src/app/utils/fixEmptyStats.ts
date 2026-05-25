import { OtterPocketBase } from "../../otterbots/utils/pocketbase/pocketbase";
import { UtilisateursDiscordType } from "../types/UtilisateursDiscordType";
import { UtilisateursDiscordStatsType } from "../types/UtilisateursDiscordStatsType";
import { otterlogs } from "../../otterbots/utils/otterlogs";

/**
 * Script de maintenance pour initialiser les statistiques des utilisateurs qui n'en ont pas encore.
 * Il crée une entrée de stats à 0 pour aujourd'hui pour chaque utilisateur sans stats.
 */
export async function fixEmptyStats() {
    otterlogs.log("Démarrage du script de récupération des statistiques vides...");

    try {
        // 1. Récupérer tous les utilisateurs
        const allUsers = await OtterPocketBase.execByAlias<UtilisateursDiscordType[]>(
            "otr-utilisateursDiscord-getAll"
        ) || [];

        // 2. Récupérer toutes les stats du jour
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const dateStr = `${day}/${month}/${year}`;

        const allStatsToday = await OtterPocketBase.execByAlias<UtilisateursDiscordStatsType[]>(
            "otr-utilisateursDiscordStats-getAll",
            { filter: `date_stats="${dateStr}"` }
        ) || [];

        // Map des IDs utilisateurs ayant déjà des stats aujourd'hui
        const usersWithStats = new Set(allStatsToday.map(s => s.discord_user));

        let createdCount = 0;

        for (const user of allUsers) {
            if (!usersWithStats.has(user.id)) {
                // L'utilisateur n'a pas de stats pour aujourd'hui, on lui en crée une vide
                await OtterPocketBase.execByAlias("otr-utilisateursDiscordStats-create", {
                    discord_user: user.id,
                    message_count: 0,
                    vocal_time: 0,
                    date_stats: dateStr,
                    voice_channels: [],
                    text_channels: [],
                    vocal_with: []
                });
                createdCount++;
            }
        }

        otterlogs.success(`Script terminé : ${createdCount} entrées de statistiques initialisées à 0.`);

    } catch (error) {
        otterlogs.error("Erreur lors de l'exécution du script fixEmptyStats : " + error);
    }
}
