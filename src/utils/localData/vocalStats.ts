import fs from "fs"
import { join } from "path"
import crypto from "crypto"
import { VocalStatsInterface } from "./interface"

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
        const vocalStats = await this.get()
        
        // Trouver la session active correspondante
        const activeSession = Object.values(vocalStats).find(
            (session) => session.discord_id === discord_id && 
                         session.channel_id === channel_id && 
                         !session.leave_date
        )

        if (!activeSession) return console.warn("⚠️ Aucune session active trouvée pour", discord_id)

        // Mettre à jour la date de sortie
        activeSession.leave_date = leave_date

        fs.writeFileSync(vocalStatsFile, JSON.stringify(vocalStats, null, 2))
    }
}
