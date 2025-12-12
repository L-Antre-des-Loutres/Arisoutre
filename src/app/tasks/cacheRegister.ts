import {lastActivityCache, nbMessageCache, vocalTimeCache} from "../config/cache";
import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {getSqlDate} from "../utils/sqlDate";

/**
 * Registers and logs all messages in the nbMessageCache.
 *
 * This method retrieves all messages stored in the `nbMessageCache` and logs them to the console.
 *
 * @return {void} Does not return any value.
 */
export async function cacheRegister(): Promise<void> {
    try {
        // Enregistrement du nombre de messages dans la BDD
        for (const [discordId] of nbMessageCache.entries()) {
            // Récupération de l'id en BDD
            const userData: UtilisateursDiscordType | undefined = await Otterlyapi.getDataByAlias(
                "otr-utilisateursDiscord-getByDiscordId",
                discordId
            );

            if (!userData) {
                otterlogs.error(`No user found in database for Discord ID: ${discordId}`);
                continue;
            }

            await Otterlyapi.putDataByAlias(
                "otr-utilisateursDiscord-updateNbMessage",
                {
                    id: userData.id,
                    nb_message: nbMessageCache.get(discordId) || 0
                }
            );
        }
        nbMessageCache.clear();

        // Enregistrement du temps vocal dans la BDD
        for (const [discordId] of vocalTimeCache.entries()) {
            // Récupération de l'id en BDD
            const userData: UtilisateursDiscordType | undefined = await Otterlyapi.getDataByAlias(
                "otr-utilisateursDiscord-getByDiscordId",
                discordId
            );

            if (!userData) {
                otterlogs.error(`No user found in database for Discord ID: ${discordId}`);
                continue;
            }

            await Otterlyapi.putDataByAlias(
                "otr-utilisateursDiscord-updateVocalTime",
                {
                    id: userData.id,
                    vocal_time: vocalTimeCache.get(discordId) || 0
                }
            );
        }
        vocalTimeCache.clear();

        // Enregistrement de la derniere activité dans la BDD
        for (const [discordId] of lastActivityCache.entries()) {
            // Récupération de l'id en BDD
            const userData: UtilisateursDiscordType | undefined = await Otterlyapi.getDataByAlias(
                "otr-utilisateursDiscord-getByDiscordId",
                discordId
            );

            if (!userData) {
                otterlogs.error(`No user found in database for Discord ID: ${discordId}`);
                continue;
            }

            await Otterlyapi.putDataByAlias(
                "otr-utilisateursDiscord-updateActivity",
                {
                    id: userData.id,
                    last_activity: lastActivityCache.get(discordId) || getSqlDate()
                }
            );
        }
        lastActivityCache.clear();

        otterlogs.success("Task cacheRegister executed successfully.");

    } catch (error) {
        otterlogs.error("Error while registering messages in cache: " + error);
    }
}

