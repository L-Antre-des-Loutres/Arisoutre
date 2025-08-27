import {Badges, BadgeType} from "./Badges";
import {logsMessage} from "../../utils/message/logs/logsMessage";
import { Client } from "discord.js";

/**
 * A constant variable holding the base API URL for interacting with the
 * Discord user resources on the Otterly API.
 *
 * @constant {string} apiurl
 * @default "https://otterlyapi.antredesloutres.fr/api/utilisateurs_discord"
 */
const apiurl = "https://otterlyapi.antredesloutres.fr/api/utilisateurs_discord";

/**
 * Represents the user's data type with their associated Discord details and activities.
 */
export type UserDataType = {
    id: number;
    discord_id: string;
    pseudo_discord: string;
    join_date_discord: string;
    first_activity: string;
    last_activity: string;
    nb_message: number;
    tag_discord: string;
    avatar_url: string;
};

export class UtilisateursBadges {
    id: number;
    discordId: string;
    pseudo: string;
    joinDate: string;
    firstActivity: string;
    lastActivity: string;
    nbMessage: number;
    tag: string;
    avatarUrl: string;

    constructor(user: UserDataType) {
        this.id = user.id;
        this.discordId = user.discord_id;
        this.pseudo = user.pseudo_discord;
        this.joinDate = user.join_date_discord;
        this.firstActivity = user.first_activity;
        this.lastActivity = user.last_activity;
        this.nbMessage = user.nb_message;
        this.tag = user.tag_discord;
        this.avatarUrl = user.avatar_url;
    }

    static async fetchData(): Promise<UtilisateursBadges[]> {
        try {
            const response = await fetch(apiurl);
            const json = await response.json();

            // Si c'est déjà un tableau
            if (Array.isArray(json)) {
                return json.map((item: UserDataType) => new UtilisateursBadges(item));
            }

            // Si c'est un objet qui contient un tableau (ex: { data: [...] } ou { users: [...] })
            if (Array.isArray(json.data)) {
                return json.data.map((item: UserDataType) => new UtilisateursBadges(item));
            }
            if (Array.isArray(json.users)) {
                return json.users.map((item: UserDataType) => new UtilisateursBadges(item));
            }

            console.warn("Format de réponse inattendu :", json);
            return [];
        } catch (error) {
            console.error("Erreur lors de l'initialisation :", error);
            return [];
        }
    }

    static async init(client: Client<boolean>) {
        let badgeAdd = 0;
        const users: UtilisateursBadges[] = await this.fetchData();

        for (const userData of users) {

            // Définition des badges possibles pour cet utilisateur
            const badgesToGive: BadgeType[] = [
                {
                    utilisateur_id: userData.id,
                    badge_id: 7, // badge de bienvenue
                    date_recu: new Date().toISOString().slice(0, 19).replace("T", " "),
                },
                // Badge des 100 messages
                ...(userData.nbMessage >= 100 ? [{
                    utilisateur_id: userData.id,
                    badge_id: 8, // badge 100 messages
                    date_recu: new Date().toISOString().slice(0, 19).replace("T", " "),
                }] : []),
                // Badge des 1000 messages
                ...(userData.nbMessage >= 1000 ? [{
                    utilisateur_id: userData.id,
                    badge_id: 9, // badge 1000 messages
                    date_recu: new Date().toISOString().slice(0, 19).replace("T", " "),
                }] : [])
            ];


            // Boucle sur tous les badges et vérifie s'il existe déjà
            for (const badge of badgesToGive) {
                const alreadyHasBadge = await Badges.hasBadge(userData.id, badge.badge_id);

                if (!alreadyHasBadge) {
                    await Badges.donBadge(badge);
                    console.log(`Badge #${badge.badge_id} attribué à ${userData.pseudo}`);
                    badgeAdd += 1
                } else {
                }
            }
        }
        logsMessage(
            "📃 Tâche périodique : Vérification et insertion des badges des utilisateurs",
            `📋 Nombre total de badge ajouté : ${badgeAdd }`,
            client, "#32a89b"
        )
    }

}
