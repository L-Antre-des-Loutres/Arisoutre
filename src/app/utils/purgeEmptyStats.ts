import { OtterPocketBase } from "../../otterbots/utils/pocketbase/pocketbase";
import { UtilisateursDiscordStatsType } from "../types/UtilisateursDiscordStatsType";
import { otterlogs } from "../../otterbots/utils/otterlogs";
import * as dotenv from "dotenv";

dotenv.config();

async function purgeEmptyStats() {
    otterlogs.log("Starting purge of empty Discord user stats (message_count=0 and vocal_time=0)...");

    try {
        const allStats = await OtterPocketBase.execByAlias<UtilisateursDiscordStatsType[]>(
            "otr-utilisateursDiscordStats-getAll"
        );

        if (!allStats || allStats.length === 0) {
            otterlogs.warn("No stats found in database.");
            return;
        }

        const emptyStats = allStats.filter(s => {
            return (s.message_count === 0 || !s.message_count) && (s.vocal_time === 0 || !s.vocal_time);
        });

        if (emptyStats.length === 0) {
            otterlogs.success("No empty records found to purge.");
            return;
        }

        otterlogs.log(`Found ${emptyStats.length} empty records to remove.`);

        let purgedCount = 0;
        for (const empty of emptyStats) {
            try {
                await OtterPocketBase.execByAlias("otr-utilisateursDiscordStats-delete", empty.id);
                purgedCount++;
                if (purgedCount % 100 === 0) {
                    otterlogs.log(`Purged ${purgedCount}/${emptyStats.length}...`);
                }
            } catch (error) {
                otterlogs.error(`Failed to delete record ${empty.id}: ${error}`);
            }
        }

        otterlogs.success(`Purge completed. Total empty records removed: ${purgedCount}`);
    } catch (error) {
        otterlogs.error("An error occurred during the purge process: " + error);
    }
}

purgeEmptyStats();
