import { Events, Client } from "discord.js"
import { BotEvent } from "../types"
import { errorLogs } from "../utils/message/logs/errorLogs"

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        
        try {
            console.log("✅ Initialisation des tâches périodiques")

            // Lancement de la tâche périodique
            import("../task/task").then(task => {
                task.task(client, process.env.GUILD_ID)
            })
        } catch (error) {
            console.error(`❌ Impossible d'exécuter le code : ${error}`)
            errorLogs("Erreur lors de l'événement task", `👤 tag : ${client.user?.username} (ID: ${client.user?.id}) \n ${error}`, client)
        }
    }
}

export default event