/**
 * Represents the type definition for a BadgeType object.
 *
 * This type is used to define the structure for a badge associated with a user,
 * including information about the user's identifier, message statistics,
 * and their last recorded activity timestamp.
 *
 * Properties:
 * - `userId` (string): A unique identifier for the user.
 * - `messageCount` (number, optional): The total count of messages associated with the user.
 * - `lastActivityAt` (Date, optional): The date and time representing the user's last activity.
 */
import {Database} from "../../database/db";

export type BadgeType = {
    id? : number,
    utilisateur_id : number,
    badge_id : number,
    date_recu: string

}

/**
 * An instance of the Database class, representing a connection to a database.
 * Provides methods and properties to interact with and manage the database,
 * including querying, inserting, updating, and deleting data.
 *
 * The `db` variable acts as the main interface for performing operations on
 * the database and handling its configuration or connection settings.
 */
const db = new Database()

/**
 * Classe abstraite de base pour tous les badges.
 * Étends cette classe pour créer des badges concrets.
 */
export abstract class Badges implements BadgeType{

    id? : number
    utilisateur_id : number
    badge_id : number
    date_recu: string

    constructor(utilisateur_id : number, badge_id : number, date_recu : string) {
        this.utilisateur_id = utilisateur_id
        this.badge_id = badge_id
        this.date_recu = date_recu
    }

    static getTableName(): string {
        return "badges_utilisateurs"
    }

    // Don du badges de l'utilisateur
    static async donBadge(badge : BadgeType) : Promise<void> {
        // Enregistrement du nouveau badges de l'utilisateur
        try {
            await db.insert(Badges.getTableName(), badge)
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du nouveau badges de l'utilisateur : ", error)
        }

    }

    static async hasBadge(id: number, badge_id: number): Promise<boolean> {
        try {
            const { results } = await db.select(Badges.getTableName(), {
                utilisateur_id: id,
                badge_id: badge_id
            });

            // Si results contient au moins un élément, l'utilisateur a déjà ce badge
            return Array.isArray(results) && results.length > 0;
        } catch (error) {
            console.error("Erreur hasBadge :", error);
            return false;
        }
    }
}