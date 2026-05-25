import { OtterPocketBase } from "../../otterbots/utils/pocketbase/pocketbase";
import { UtilisateursDiscordStatsType } from "../types/UtilisateursDiscordStatsType";
import { otterlogs } from "../../otterbots/utils/otterlogs";
import * as dotenv from "dotenv";

dotenv.config();

async function purgeOrphanStats() {
    otterlogs.log("Starting purge of orphan Discord user stats...");

    try {
        const allStats = await OtterPocketBase.execByAlias<UtilisateursDiscordStatsType[]>(
            "otr-utilisateursDiscordStats-getAll"
        );

        if (!allStats || allStats.length === 0) {
            otterlogs.warn("No stats found in database.");
            return;
        }

        const orphans = allStats.filter(s => {
            const hasNoUser = !s.discord_user || s.discord_user === "";
            const hasNoDate = (!s.date_stats || s.date_stats === "") && (!s.date_stat || s.date_stat === "");
            return hasNoUser && hasNoDate;
        });

        if (orphans.length === 0) {
            otterlogs.success("No orphan records found to purge.");
            return;
        }

        otterlogs.log(`Found ${orphans.length} orphan records to remove.`);

        let purgedCount = 0;
        for (const orphan of orphans) {
            try {
                await OtterPocketBase.execByAlias("otr-utilisateursDiscordStats-delete", orphan.id);
                purgedCount++;
                if (purgedCount % 100 === 0) {
                    otterlogs.log(`Purged ${purgedCount}/${orphans.length}...`);
                }
            } catch (error) {
                otterlogs.error(`Failed to delete record ${orphan.id}: ${error}`);
            }
        }

        otterlogs.success(`Purge completed. Total orphan records removed: ${purgedCount}`);
    } catch (error) {
        otterlogs.error("An error occurred during the purge process: " + error);
    }
}

purgeOrphanStats();
