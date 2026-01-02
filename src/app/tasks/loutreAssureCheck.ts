import {Otterlyapi} from "../../otterbots/utils/otterlyapi/otterlyapi";
import {discordActivityScore} from "../utils/activityScore";
import {UtilisateursDiscordType} from "../types/UtilisateursDiscordType";
import {otterlogs} from "../../otterbots/utils/otterlogs";
import {roles} from "../../../config/discordConfig.json";

export async function loutreAssureCheck() {
    try {
        // On récupére les utilisateurs Discord
        const utilisateurs: UtilisateursDiscordType[] | undefined = await Otterlyapi.getDataByAlias("otr-utilisateursDiscord-getAll")

        if (!utilisateurs) {
            otterlogs.warn("Aucun utilisateur trouvé pour la vérification du score de loutre assuré.")
            return
        }

        // On vérifie le score pour les utilisateurs n'ayant pas encore le rôle loutre assuré
        // TODO : LES PERSONNES SANS ROLES DOIVENT ETRE IGNOREE
        for (const utilisateur of utilisateurs) {
            if (!utilisateur.roles.some(role => role.id === roles.loutre_assure)) {
                if (await discordActivityScore(utilisateur.nb_message, utilisateur.vocal_time) > 30) {
                    otterlogs.log(`L'utilisateur ${utilisateur.pseudo_discord} a atteint le score de loutre assuré.`)
                }
            }
        }

    } catch (error) {
        otterlogs.error('Erreur lors de la vérification du score de loutre assuré:'+ error)
    }
}