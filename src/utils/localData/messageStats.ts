import { join } from "path"
import { MessageStatsInterface } from "./interface"
import * as fs from "fs"

// TODO : Try & Catch pour chaque fonction

const messageStatsDir = join(__dirname, "../../../localData/messageStats")
const messageStatsFile = join(messageStatsDir, "messageStats.json")

export class MessageStats implements MessageStatsInterface {
    discord_id: string
    channel_id: string
    number_of_messages: number
    date: string

    constructor(discord_id: string, channel_id: string, number_of_messages: number, date: string) {
        this.discord_id = discord_id
        this.channel_id = channel_id
        this.number_of_messages = number_of_messages
        this.date = date
    }

    static async init() {
        if (!fs.existsSync(messageStatsDir)) fs.mkdirSync(messageStatsDir, { recursive: true })
        if (!fs.existsSync(messageStatsFile)) fs.writeFileSync(messageStatsFile, "{}")
    }

    static async get(): Promise<{ [key: string]: { discord_id: string; channel_id: string; number_of_messages: number; date: Date } }> {
        if (!fs.existsSync(messageStatsFile)) return {}
        return JSON.parse(fs.readFileSync(messageStatsFile, "utf8"))
    }

    static async set(messageStat: MessageStats) {

        await this.init();
        const messageStats = await this.get(); // Récupère les stats de messages existantes
    
        // Formate le message pour le stockage
        const message: { discord_id: string; channel_id: string; number_of_messages: number; date: Date } = {
            discord_id: messageStat.discord_id,
            channel_id: messageStat.channel_id,
            number_of_messages: messageStat.number_of_messages,
            date: new Date(messageStat.date),
        };
    
        // Crée une clé unique pour identifier la session : utilisateur + salon + date
        const key = `${messageStat.discord_id}-${messageStat.channel_id}-${messageStat.date}`;
    
        // Vérifie si une session existe déjà avec cette clé
        if (messageStats[key]) {

            // Si la session existe, récupère l'ancien nombre de messages et l'augmente
            messageStats[key].number_of_messages += messageStat.number_of_messages;

        } else {

            // Sinon, crée une nouvelle session
            messageStats[key] = message;
        }
    
        // Sauvegarde les stats mises à jour dans le fichier
        fs.writeFileSync(messageStatsFile, JSON.stringify(messageStats, null, 2));
    }
    
}

    