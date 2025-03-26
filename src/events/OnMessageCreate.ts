import { Events, Message } from "discord.js"
import { errorLogs } from "../utils/message/logs/errorLogs"

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    
    try {
      if (message.author.bot) return

      // Convertir le contenu du message en minuscules
      const messageContent = message.content.toLowerCase()

      if (messageContent.includes("ratio")) {
        // Votre code à exécuter si le message contient 'ratio'
        message.react("👻")
      }
    } catch (error) {
      console.error(`❌ Impossible d'exécuter l\'événement OnMessageCreate : ${error}`)
      errorLogs("Erreur lors de l'événement OnMessageCreate", `👤 tag : ${message.author.username} (ID: ${message.author.id}) \n ${error}`, message.client)
    }
  },
}
