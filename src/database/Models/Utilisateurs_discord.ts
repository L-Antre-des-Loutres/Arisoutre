import { I_Utilisateurs_discord } from "../../types"
import { Database } from "../db"

const db = new Database()

// Interface représentant un utilisateur Discord dans ta base
export interface UtilisateurDiscord {
    discord_id: string;
    tag_discord: string;
    pseudo_discord: string;
    join_date_discord: string;
    first_activity: string | null;
    last_activity: string | null;
    nb_message: number;
}

// Interface du résultat de la méthode db.select
export interface DbSelectResult<T> {
    results: T[];
    fields: any[];
}

export class UtilisateursDiscord implements I_Utilisateurs_discord {
    discord_id!: string
    tag_discord!: string
    pseudo_discord!: string
    join_date_discord!: string
    last_activity!: string
    first_activity!: string
    nb_message!: number

    constructor(discord_id: string, pseudo_discord: string, tag_discord: string, join_date_discord: string) {
        this.discord_id = discord_id
        this.pseudo_discord = pseudo_discord
        this.tag_discord = tag_discord
        this.join_date_discord = join_date_discord
    }


    static getTableName(): string {
        return "utilisateurs_discord"
    }

    static async register(utilisateurDiscord: UtilisateursDiscord): Promise<void> {

        try {
            // Vérifie si le membre est déjà enregistré
            const utilisateurDiscordDb = await db.select(UtilisateursDiscord.getTableName(),
                {discord_id: utilisateurDiscord.discord_id})

            // Si le membre est déjà enregistré, met à jour la date de join et le pseudo
            if (Array.isArray(utilisateurDiscordDb.results) && utilisateurDiscordDb.results.length > 0) {
                // Met à jour la date de join et le pseudo
                await db.update(UtilisateursDiscord.getTableName(), utilisateurDiscord, `discord_id = ${utilisateurDiscord.discord_id}`)
            } else {
                // Enregistre le membre dans la base de données
                await db.insert(UtilisateursDiscord.getTableName(), utilisateurDiscord)
            }

        } catch (error) {
            console.error('❌ Erreur lors de l\'enregistrement de l\'utilisateur : ', error)
        }
    }

    static async delete(discord_id: string) {

        try {
            // Supprime le membre de la base de données

            // Vérifie si l'id discord est valide via un regex
            const regex = /^\d+$/;
            if (!regex.exec(discord_id)) {return}

            await db.delete(UtilisateursDiscord.getTableName(), [discord_id], `discord_id = ${discord_id}`)
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de l\'utilisateur : ', error)
        }
    }

    // Enregistre la dernière activité

    static async registerLastActivity(discord_id: string): Promise<void> {
        try {
            // On force ici le typage du résultat de db.select
            const activity = await db.select(
                UtilisateursDiscord.getTableName(),
                { discord_id }
            ) as DbSelectResult<UtilisateurDiscord>;

            if (activity.results.length > 0) {
                const user = activity.results[0];
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

                const updateData: Partial<UtilisateurDiscord> = {
                    last_activity: now,
                    nb_message: (user.nb_message ?? 0) + 1,
                };

                if (!user.first_activity) {
                    updateData.first_activity = now;
                }

                await db.update(
                    UtilisateursDiscord.getTableName(),
                    updateData,
                    `discord_id = '${discord_id}'`
                );
            } else {return}
        } catch (error) {
            console.error("❌ Erreur dans registerLastActivity :", error);
        }
    }
}

export default UtilisateursDiscord
