import { I_Utilisateurs_discord } from "../../types"
import { Database } from "../db"

const db = new Database()

export class UtilisateursDiscord implements I_Utilisateurs_discord {
    discord_id!: string
    pseudo_discord!: string
    join_date_discord!: string

    constructor(discord_id: string, pseudo_discord: string, join_date_discord: string) {
        this.discord_id = discord_id
        this.pseudo_discord = pseudo_discord
        this.join_date_discord = join_date_discord
    }


    static getTableName(): string {
        return "utilisateurs_discord"
    }

    static async getAll() {
        // Récupérer tous les utilisateurs
        // Vérifie si le membre est déjà enregistré
        try {
            const utilisateursDiscord = await db.select(UtilisateursDiscord.getTableName(), [])
            return utilisateursDiscord
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des utilisateurs : ', error)
        }
    }

    static async register(utilisateurDiscord: UtilisateursDiscord): Promise<void> {

        try {
            // Vérifie si le membre est déjà enregistré
            const utilisateurDiscordDb = await db.select(UtilisateursDiscord.getTableName(), [utilisateurDiscord.discord_id])

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

}

export default UtilisateursDiscord
