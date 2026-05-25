import { OtterPocketBase } from "../../otterbots/utils/pocketbase/pocketbase";
import { UtilisateursDiscordType } from "../types/UtilisateursDiscordType";
import { otterlogs } from "../../otterbots/utils/otterlogs";
import * as dotenv from "dotenv";

dotenv.config();

async function purgeDuplicates() {
    otterlogs.log("Starting purge of duplicate Discord users...");

    try {
        // On récupère tous les utilisateurs de la BDD triés par date de création (plus anciens en premier)
        const allDbUsers = await OtterPocketBase.execByAlias<UtilisateursDiscordType[]>(
            "otr-utilisateursDiscord-getAll",
            { sort: 'created' }
        );

        if (!allDbUsers || allDbUsers.length === 0) {
            otterlogs.warn("No users found in database.");
            return;
        }

        const dbUsersMap = new Map<string, UtilisateursDiscordType[]>();
        for (const u of allDbUsers) {
            if (!dbUsersMap.has(u.discord_id)) {
                dbUsersMap.set(u.discord_id, []);
            }
            dbUsersMap.get(u.discord_id)!.push(u);
        }

        let purgedCount = 0;

        for (const [discordId, users] of dbUsersMap) {
            if (users.length > 1) {
                // Le premier est le plus ancien car on a trié par 'created'
                const oldest = users[0];
                otterlogs.log(`Found ${users.length} entries for ${oldest.username} (${discordId}). Keeping the oldest one (${oldest.id}).`);

                for (let i = 1; i < users.length; i++) {
                    const duplicate = users[i];
                    otterlogs.debug(`Deleting duplicate: ${duplicate.id} (created: ${duplicate.created || 'unknown'})`);
                    await OtterPocketBase.execByAlias("otr-utilisateursDiscord-delete", duplicate.id);
                    purgedCount++;
                }
            }
        }

        otterlogs.success(`Purge completed. Total duplicates removed: ${purgedCount}`);
    } catch (error) {
        otterlogs.error("An error occurred during the purge process: " + error);
    }
}

purgeDuplicates();
