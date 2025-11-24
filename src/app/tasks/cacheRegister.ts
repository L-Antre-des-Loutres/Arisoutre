import {nbMessageCache} from "../config/cache";
import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";

/**
 * Registers and logs all messages in the nbMessageCache.
 *
 * This method retrieves all messages stored in the `nbMessageCache` and logs them to the console.
 *
 * @return {void} Does not return any value.
 */
export async function cacheRegister(): Promise<void> {
    try {
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
        otterlogs.success("Task cacheRegister executed successfully.");

    } catch (error) {
        otterlogs.error("Error while registering messages in cache: " + error);
    }
}

