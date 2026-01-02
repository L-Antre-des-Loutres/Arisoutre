import {
    lastActivityCache,
    nbMessageCache,
    textChannelCache,
    vocalTimeCache,
    vocalWithCache,
    voiceChannelCache
} from "../config/cache";
import { Otterlyapi } from "../../otterbots/utils/otterlyapi/otterlyapi";
import { otterlogs } from "../../otterbots/utils/otterlogs";
import { UtilisateursDiscordType } from "../types/UtilisateursDiscordType";
import { getSqlDate } from "../utils/sqlDate";
import { UtilisateursDiscordStatsType } from "../types/UtilisateursDiscordStatsType";

/**
 * Registers and logs all messages in the nbMessageCache.
 *
 * This method retrieves all messages stored in the `nbMessageCache` and logs them to the console.
 *
 * @return {void} Does not return any value.
 */
export async function cacheRegister(): Promise<void> {
    // On prépare notre variable
    const statsToPush: { discordId: string; stats: UtilisateursDiscordStatsType }[] = [];

    try {
        // Enregistrement du nombre de messages et du temps vocal dans un tableau
        const uniqueDiscordIds = new Set([...nbMessageCache.keys(), ...vocalTimeCache.keys()]);

        for (const discordId of uniqueDiscordIds) {
            // Récupération de l'id en BDD
            const userData: UtilisateursDiscordType | undefined = await Otterlyapi.getDataByAlias(
                "otr-utilisateursDiscord-getByDiscordId",
                discordId
            );

            if (!userData) {
                otterlogs.error(`No user found in database for Discord ID: ${discordId}`);
                continue;
            }

            let isUpdated = false;

            // Ajout du nombre de messages
            const nbMessages = nbMessageCache.get(discordId);
            if (nbMessages) {
                userData.nb_message += nbMessages;
                isUpdated = true;
            }

            // Ajout du temps vocal
            const vocalTime = vocalTimeCache.get(discordId);
            if (vocalTime) {
                userData.vocal_time += vocalTime;
                isUpdated = true;
            }

            // Ajout des channels textuels et vocal avec lequel l'utilisateur à interagi
            const textChannels = textChannelCache.get(discordId) || [];
            const voiceChannels = voiceChannelCache.get(discordId) || [];
            const vocalWith = vocalWithCache.get(discordId) || [];

            if (isUpdated) {
                const date = new Date();
                const day = String(new Date(date.getTime() - 86400000).getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();

                const stats: UtilisateursDiscordStatsType = {
                    id: 0,
                    id_utilisateur: userData.id,
                    nb_message: nbMessages || 0,
                    vocal_time: vocalTime || 0,
                    date_stats: `${day}/${month}/${year}`,
                    voice_channels: voiceChannels,
                    text_channels: textChannels,
                    vocal_with: vocalWith
                };
                statsToPush.push({ discordId, stats });
            }
        }

        // On log le tableau pour vérification (temporaire ou définitif selon besoin)
        if (statsToPush.length > 0) {
            otterlogs.success(`Prepared stats for ${statsToPush.length} users.`);
            let successCount = 0;
            let failureCount = 0;

            for (const item of statsToPush) {
                const result = await Otterlyapi.postDataByAlias("otr-utilisateursDiscordStats-create", item.stats);
                if (result) {
                    successCount++;
                    // Suppression du cache pour cet utilisateur UNIQUEMENT en cas de succès
                    nbMessageCache.delete(item.discordId);
                    vocalTimeCache.delete(item.discordId);
                    textChannelCache.delete(item.discordId);
                    voiceChannelCache.delete(item.discordId);
                    vocalWithCache.delete(item.discordId);
                } else {
                    failureCount++;
                }
            }

            if (failureCount === 0) {
                otterlogs.success(`Successfully uploaded stats for all ${successCount} users.`);
            } else if (successCount === 0) {
                otterlogs.error(`Failed to upload stats for all ${failureCount} users.`);
            } else {
                otterlogs.warn(`Partial success: Uploaded ${successCount} users, failed ${failureCount} users.`);
            }
        }

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

            const cachedActivity = lastActivityCache.get(discordId) || getSqlDate();

            if (userData.last_activity && cachedActivity < userData.last_activity) {
                lastActivityCache.delete(discordId);
                continue;
            }

            await Otterlyapi.putDataByAlias(
                "otr-utilisateursDiscord-updateActivity",
                {
                    id: userData.id,
                    last_activity: cachedActivity
                }
            );

            // Suppression du cache pour cet utilisateur
            lastActivityCache.delete(discordId);
        }

        otterlogs.success("Task cacheRegister executed successfully.");

    } catch (error) {
        otterlogs.error("Error while registering messages in cache: " + error);
    }
}



