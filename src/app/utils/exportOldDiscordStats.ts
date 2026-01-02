import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {UtilisateursDiscordStatsType} from "../types/UtilisateursDiscordStatsType";

/**
 * Exports old Discord statistics for all users.
 * Retrieves a list of Discord users and processes their statistics to generate and export data
 * if certain conditions are met (e.g., having messages or vocal time). The process involves
 * creating statistical entries and posting them using the Otterly API.
 *
 * @return {Promise<void>} A promise that resolves once the export process is completed.
 */
export async function exportOldDiscordStats() {
    const utilisateurs: UtilisateursDiscordType[] | undefined = await Otterlyapi.getDataByAlias("otr-utilisateursDiscord-getAll")
    if (!utilisateurs) {
        console.error("Aucun utilisateur trouvé pour l'export des statistiques Discord.")
        return
    }

    for (const utilisateur of utilisateurs) {
        const preExportStats: UtilisateursDiscordStatsType = {
            id: 0,
            id_utilisateur: utilisateur.id,
            nb_message: utilisateur.nb_message,
            vocal_time: utilisateur.vocal_time,
            date_stats: "2025",
            vocal_with: [],
            text_channels: [],
            voice_channels: [],
        }
        if (preExportStats.nb_message > 0 || preExportStats.vocal_time > 0) {
            await Otterlyapi.postDataByAlias("otr-utilisateursDiscordStats-create", preExportStats)
        }
    }
}