import { Otterlyapi } from "../../otterbots/utils/otterlyapi/otterlyapi";
import { discordActivityScore } from "../utils/activityScore";
import { UtilisateursDiscordType } from "../types/UtilisateursDiscordType";
import { otterlogs } from "../../otterbots/utils/otterlogs";
import { roles } from "../../../config/discordConfig.json";
import { UtilisateursDiscordStatsType } from "../types/UtilisateursDiscordStatsType";
import { getClient } from "../index";

/**
 * Checks Discord users' activity scores to determine if they qualify for the "Loutre Assuré" role.
 * Evaluates users without the "Loutre Assuré" role but with the "Loutre" role, ensuring they meet the required activity condition.
 * Fetches user and activity data from specified API endpoints, calculates scores, and logs the addition of roles for eligible users.
 *
 * @async
 * @function
 * @return {Promise<void>} A promise that resolves when the check process is completed or logs errors if an issue occurs.
 */
export async function loutreAssureCheck() {
    try {
        // On récupére les utilisateurs Discord
        const utilisateurs: UtilisateursDiscordType[] | undefined = await Otterlyapi.getDataByAlias("otr-utilisateursDiscord-getAll")
        const utilisateursStats: UtilisateursDiscordStatsType[] | undefined = await Otterlyapi.getDataByAlias("otr-utilisateursDiscordStats-getAll")

        if (!utilisateurs || !utilisateursStats) {
            otterlogs.warn("Aucun utilisateur trouvé pour la vérification du score de loutre assuré.")
            return
        }

        const client = getClient();

        // On vérifie le score pour les utilisateurs n'ayant pas encore le rôle loutre assuré
        for (const utilisateur of utilisateurs) {
            if (!utilisateur.roles.some(role => role.id === roles.loutre_assure)
                && utilisateur.roles.some(role => role.id === roles.loutre)
                && !utilisateur.delete_date) {
                // On récupère les stats de l'utilisateur
                const stats = utilisateursStats.filter(stat => stat.id_utilisateur === utilisateur.id)
                const totalMessages = stats.reduce((sum, stat) => sum + stat.nb_message, 0)
                const totalVocalTime = stats.reduce((sum, stat) => sum + stat.vocal_time, 0)

                // On vérifie si le score d'activité est supérieur à 30
                if (await discordActivityScore(totalMessages, totalVocalTime) > 30) {
                    const guildId = process.env.DISCORD_GUILD_ID;
                    if (!guildId) {
                        otterlogs.error("DISCORD_GUILD_ID manquant dans les variables d'environnement.");
                        continue;
                    }

                    try {
                        const guild = await client.guilds.fetch(guildId);
                        const member = await guild.members.fetch(utilisateur.discord_id);

                        await member.roles.add(roles.loutre_assure);
                        await member.roles.remove(roles.loutre);
                        otterlogs.log(`L'utilisateur ${utilisateur.pseudo_discord} a obtenu le role Loutre assure automatiquement. (score d'activite superieur a 30)`);
                    } catch (error) {
                        otterlogs.warn(`Impossible de trouver l'utilisateur ${utilisateur.pseudo_discord} ou la guilde (${guildId}): ${error}`);
                    }
                }
            }
        }
    } catch (error) {
        otterlogs.error('Erreur lors de la vérification du score de loutre assuré:' + error)
    }
}