import {
    lastActivityCache,
    nbMessageCache,
    textChannelCache,
    vocalTimeCache,
    vocalWithCache,
    voiceChannelCache
} from "../config/cache";
import { OtterPocketBase } from "../../otterbots/utils/pocketbase/pocketbase";
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
    const statsToPush: { discordId: string; stats: Partial<UtilisateursDiscordStatsType> }[] = [];

    try {
        // Enregistrement du nombre de messages et du temps vocal dans un tableau
        const uniqueDiscordIds = new Set([...nbMessageCache.keys(), ...vocalTimeCache.keys()]);

        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const dateStr = `${day}/${month}/${year}`;

        for (const discordId of uniqueDiscordIds) {
            // Récupération de l'id en BDD
            const userData: UtilisateursDiscordType | undefined = await OtterPocketBase.execByAlias<UtilisateursDiscordType>(
                "otr-utilisateursDiscord-getByDiscordId",
                `discord_id="${discordId}"`
            );

            if (!userData) {
                otterlogs.error(`No user found in database for Discord ID: ${discordId}`);
                continue;
            }

            // Ajout du nombre de messages
            const nbMessages = nbMessageCache.get(discordId) || 0;
            const vocalTime = vocalTimeCache.get(discordId) || 0;

            // Ajout des channels textuels et vocal avec lequel l'utilisateur à interagi
            const textChannels = textChannelCache.get(discordId) || [];
            const voiceChannels = voiceChannelCache.get(discordId) || [];
            const vocalWith = vocalWithCache.get(discordId) || [];

            const stats: Partial<UtilisateursDiscordStatsType> = {
                discord_user: userData.id,
                message_count: nbMessages,
                vocal_time: vocalTime,
                date_stats: dateStr,
                voice_channels: voiceChannels,
                text_channels: textChannels,
                vocal_with: vocalWith
            };
            statsToPush.push({ discordId, stats });
        }

        if (statsToPush.length > 0) {
            otterlogs.success(`Processing stats for ${statsToPush.length} users.`);
            
            for (const item of statsToPush) {
                try {
                    // On vérifie si une stat existe déjà pour cet utilisateur et ce jour
                    const existingStat = await OtterPocketBase.execByAlias<UtilisateursDiscordStatsType>(
                        "otr-utilisateursDiscordStats-getAll",
                        { filter: `discord_user="${item.stats.discord_user}" && date_stats="${item.stats.date_stats}"` }
                    );

                    const statToUpdate = Array.isArray(existingStat) ? existingStat[0] : null;

                    if (statToUpdate) {
                        // MERGE : On additionne les valeurs
                        const mergedData = {
                            message_count: (statToUpdate.message_count || 0) + (item.stats.message_count || 0),
                            vocal_time: (statToUpdate.vocal_time || 0) + (item.stats.vocal_time || 0),
                            // Pour les tableaux, on concatène et on dédoublonne si nécessaire (ici simple concat pour l'historique)
                            voice_channels: [...(statToUpdate.voice_channels || []), ...(item.stats.voice_channels || [])],
                            text_channels: [...(statToUpdate.text_channels || []), ...(item.stats.text_channels || [])],
                            vocal_with: [...(statToUpdate.vocal_with || []), ...(item.stats.vocal_with || [])]
                        };

                        await OtterPocketBase.execByAlias("otr-utilisateursDiscordStats-update", statToUpdate.id, mergedData);
                    } else {
                        // CREATE
                        await OtterPocketBase.execByAlias("otr-utilisateursDiscordStats-create", item.stats);
                    }

                    // Nettoyage du cache
                    nbMessageCache.delete(item.discordId);
                    vocalTimeCache.delete(item.discordId);
                    textChannelCache.delete(item.discordId);
                    voiceChannelCache.delete(item.discordId);
                    vocalWithCache.delete(item.discordId);

                } catch (err) {
                    otterlogs.error(`Error processing stat for ${item.discordId}: ${err}`);
                }
            }
        }

        // Si on est le 1er du mois, on reset le temps vocal et le nombre de messages dans la BDD
        if (new Date().getDate() === 1) {
            otterlogs.log("Premier jour du mois : réinitialisation des statistiques mensuelles...");
            // monthly stat reset logic commented out as discord_users no longer has these fields
            // const allUsers: UtilisateursDiscordType[] | undefined = await OtterPocketBase.execByAlias("otr-utilisateursDiscord-getAll");
            // if (allUsers) { ... }
            otterlogs.success("Réinitialisation des statistiques mensuelles terminée.");
        }

        // Enregistrement de la derniere activité dans la BDD
        for (const [discordId] of lastActivityCache.entries()) {
            // Récupération de l'id en BDD
            const userData: UtilisateursDiscordType | undefined = await OtterPocketBase.execByAlias<UtilisateursDiscordType>(
                "otr-utilisateursDiscord-getByDiscordId",
                `discord_id="${discordId}"`
            );

            if (!userData) {
                otterlogs.error(`No user found in database for Discord ID: ${discordId}`);
                continue;
            }

            const cachedActivity = lastActivityCache.get(discordId) || getSqlDate();

            if (userData.last_active_at && cachedActivity < userData.last_active_at) {
                lastActivityCache.delete(discordId);
                continue;
            }

            await OtterPocketBase.execByAlias(
                "otr-utilisateursDiscord-update",
                userData.id,
                {
                    last_active_at: cachedActivity
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




