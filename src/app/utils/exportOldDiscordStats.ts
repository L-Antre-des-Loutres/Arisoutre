import {OtterPocketBase} from "../../otterbots/utils/pocketbase/pocketbase";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {otterlogs} from "../../otterbots/utils/otterlogs";

/**
 * Exports old Discord statistics for all users.
 * Retrieves a list of Discord users and processes their statistics to generate and export data
 * if certain conditions are met (e.g., having messages or vocal time). The process involves
 * creating statistical entries and posting them using the Otterly API.
 *
 * @return {Promise<void>} A promise that resolves once the export process is completed.
 */
export async function exportOldDiscordStats() {
    const utilisateurs: UtilisateursDiscordType[] | undefined = await OtterPocketBase.execByAlias<UtilisateursDiscordType[]>("otr-utilisateursDiscord-getAll")
    if (!utilisateurs) {
        console.error("Aucun utilisateur trouvé pour l'export des statistiques Discord.")
        return
    }

    otterlogs.warn("exportOldDiscordStats called but nb_message and vocal_time are removed from UtilisateursDiscordType. No stats will be exported.");
}