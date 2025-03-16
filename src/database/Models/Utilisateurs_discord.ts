import { I_Utilisateurs_discord } from "../../types";
import { Database } from "../db";

export class UtilisateursDiscord implements I_Utilisateurs_discord {
    discord_id!: string;
    pseudo_discord!: string;
    join_date_discord!: string;
    dern_activite?: Date;

    constructor(discord_id: string, pseudo_discord: string, join_date_discord: string) {
        this.discord_id = discord_id;
        this.pseudo_discord = pseudo_discord;
        this.join_date_discord = join_date_discord;
    }

    static getTableName(): string {
        return "utilisateurs_discord";
    }

    static async getAll() {
        // Récupérer tous les utilisateurs
        const db = new Database();

        // Vérifie si le membre est déjà enregistré
        try {
            const utilisateursDiscord = await db.select(UtilisateursDiscord.getTableName(), []);
            return utilisateursDiscord;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des utilisateurs : ', error);
        }
    }

    static async register(utilisateurDiscord: UtilisateursDiscord): Promise<void> {
        const db = new Database();

        try {
            // Vérifie si le membre est déjà enregistré
            const utilisateurDiscordDb = await db.select(UtilisateursDiscord.getTableName(), [utilisateurDiscord.discord_id]);

            // Si le membre est déjà enregistré, ne rien faire
            if (Array.isArray(utilisateurDiscordDb.results) && utilisateurDiscordDb.results.length > 0) return;

            // Enregistre le membre dans la base de données
            await db.insert(UtilisateursDiscord.getTableName(), utilisateurDiscord);

        } catch (error) {
            console.error('❌ Erreur lors de l\'enregistrement de l\'utilisateur : ', error);
        }
    }

    static async delete(discord_id: string) {
        const db = new Database();

        try {

            // Vérifie si le membre est déjà enregistré
            const utilisateurDiscordDb = await db.select(UtilisateursDiscord.getTableName(), [discord_id]);

            // Si le membre n'est pas déjà enregistré, ne rien faire
            if (Array.isArray(utilisateurDiscordDb.results) && utilisateurDiscordDb.results.length === 0) return;

            // Supprime le membre de la base de données
            await db.delete(UtilisateursDiscord.getTableName(), [discord_id]);
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de l\'utilisateur : ', error);
        }
    }

    // Enregistrement de la dernière activité du membre
    static async update_dern_activite(utilisateurDiscord: UtilisateursDiscord) {
        const db = new Database();

        try {
            // Vérifie si le membre est déjà enregistré
            const utilisateurDiscordDb = await db.select(UtilisateursDiscord.getTableName(), [utilisateurDiscord.discord_id]);

            // Si le membre n'est pas déjà enregistré, ne rien faire
            if (Array.isArray(utilisateurDiscordDb.results) && utilisateurDiscordDb.results.length === 0) return;

            // Met à jour la date de join
            await db.update(UtilisateursDiscord.getTableName(), { dern_activite: utilisateurDiscord.dern_activite }, `discord_id = ${utilisateurDiscord.discord_id}`);

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour de la date de join : ', error);
        }
    }

}

export default UtilisateursDiscord;
