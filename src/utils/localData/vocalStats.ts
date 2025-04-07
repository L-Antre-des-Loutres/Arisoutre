import fs from "fs"
import { join } from "path"
import crypto from "crypto"
import { VocalStatsInterface } from "./interface"

// TODO : Try & Catch pour chaque fonction

const vocalStatsDir = join(__dirname, "../../../localData/vocalStats")
const vocalStatsFile = join(vocalStatsDir, "vocalStats.json")

export class VocalStats implements VocalStatsInterface {
    discord_id: string
    channel_id: string
    join_date: Date
    leave_date?: Date
    session_id: string

    constructor(discord_id: string, channel_id: string, join_date: Date, leave_date?: Date) {
        this.discord_id = discord_id
        this.channel_id = channel_id
        this.join_date = join_date
        this.leave_date = leave_date
        this.session_id = this.generateSessionId()
    }

    private generateSessionId(): string {
        return crypto.createHash("sha256")
            .update(this.discord_id + this.channel_id + this.join_date.toISOString())
            .digest("hex")
    }

    static async init() {
        if (!fs.existsSync(vocalStatsDir)) fs.mkdirSync(vocalStatsDir, { recursive: true })
        if (!fs.existsSync(vocalStatsFile)) fs.writeFileSync(vocalStatsFile, "{}")
    }

    static async get(): Promise<{ [key: string]: { session_id: string; discord_id: string; channel_id: string; join_date: Date; leave_date?: Date } }> {
        if (!fs.existsSync(vocalStatsFile)) return {}
        return JSON.parse(fs.readFileSync(vocalStatsFile, "utf8"))
    }

    static async set(vocalStat: VocalStats) {
        await this.init()
        const vocalStats = await this.get()

        const reorderedVocalStat: { session_id: string; discord_id: string; channel_id: string; join_date: Date; leave_date?: Date } = {
            session_id: vocalStat.session_id,  
            discord_id: vocalStat.discord_id,
            channel_id: vocalStat.channel_id,
            join_date: vocalStat.join_date,
            leave_date: vocalStat.leave_date
        };
        
        // Ajoute la nouvelle session
        vocalStats[vocalStat.session_id] = reorderedVocalStat
        fs.writeFileSync(vocalStatsFile, JSON.stringify(vocalStats, null, 2))
    }

    static async updateLeaveDate(discord_id: string, channel_id: string, leave_date: Date) {
        const vocalStats = await this.get();
    
        const today = new Date();
        today.setHours(0, 0, 0, 0); // aujourd'hui à 00:00
    
        // Trouver la session active (non terminée)
        const activeSessionEntry = Object.entries(vocalStats).find(
            ([_, session]) =>
                session.discord_id === discord_id &&
                session.channel_id === channel_id &&
                !session.leave_date
        );
    
        if (!activeSessionEntry) {
            console.warn("⚠️ Aucune session active trouvée pour", discord_id);
            return;
        }
    
        const [, activeSession] = activeSessionEntry;
    
        const joinDate = new Date(activeSession.join_date);
    
        if (joinDate < today) {
            // La session a commencé hier ou avant → on la coupe en deux
    
            // 1. Fermer la session d'origine à minuit
            activeSession.leave_date = new Date(today); // aujourd'hui à 00:00
    
            // 2. Créer une nouvelle session pour aujourd'hui
            const newSession = new VocalStats(discord_id, channel_id, today, leave_date);
    
            // Ajouter cette nouvelle session
            vocalStats[newSession.session_id] = {
                session_id: newSession.session_id,
                discord_id: newSession.discord_id,
                channel_id: newSession.channel_id,
                join_date: newSession.join_date,
                leave_date: newSession.leave_date,
            };
        } else {
            // Sinon, la session a commencé aujourd'hui → on la ferme normalement
            activeSession.leave_date = leave_date;
        }
        fs.writeFileSync(vocalStatsFile, JSON.stringify(vocalStats, null, 2));
    }
    

    // Récupérer le temps de vocal total d'un utilisateur
    static async getTotalVocalTime(discord_id: string): Promise<string> {
        const vocalStats = await this.get();
        const vocalTime = Object.values(vocalStats).reduce((acc, session) => {
            if (session.discord_id === discord_id && session.leave_date !== undefined) {
                return acc + (new Date(session.leave_date).getTime() - new Date(session.join_date).getTime());
            }
            return acc;
        }, 0);
    
        // Conversion du temps en heures, minutes et secondes
        const totalSeconds = Math.floor(vocalTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
    
        return `${hours}h ${minutes}m ${seconds}s`;
    }
}
