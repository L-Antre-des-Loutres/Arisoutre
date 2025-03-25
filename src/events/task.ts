import { Events, Client} from "discord.js"
import { BotEvent } from "../types"

const event: BotEvent = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client): Promise<void> {
        console.log ("✅ Initialisation des tâches périodiques")
        
        // Lancement de la tâche périodique
        import("../task/task").then(task => {
            task.task(client, process.env.GUILD_ID)
        })
    }}

export default event