import { Events, Message } from "discord.js"
import { errorLogs } from "../utils/message/logs/errorLogs"
import UtilisateursDiscord from "../database/Models/Utilisateurs_discord";

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    try {
      if (message.author.bot) return

      // Convertir le contenu du message en minuscules
      const messageContent = message.content.toLowerCase()

      const author = message.author.id

      await UtilisateursDiscord.registerLastActivity(author)

      if (messageContent.includes("ratio")) {
        // Votre code à exécuter si le message contient 'ratio'
        await message.react("👻")
      }
    } catch (error) {
      console.error(`❌ Impossible d'exécuter l\'événement OnMessageCreate : ${error}`)
      errorLogs("Erreur lors de l'événement OnMessageCreate", `👤 tag : ${message.author.username} (ID: ${message.author.id}) \n ${error}`, message.client)
    }
  },
}
