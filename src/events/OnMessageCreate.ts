import { Events, Message } from "discord.js"
import { errorLogs } from "../utils/message/logs/errorLogs"
import { MessageStats } from "../utils/localData/messageStats"

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

      // Gestion des stats de messages
      try {

        // Prépare les données pour l'enregistrement
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remettre l'heure à 00:00
        
        // Formater en yyyy-mm-dd
        const formattedDate = today.toISOString().split('T')[0];
        
        const newMessage = new MessageStats(
          message.author.id,
          message.channel.id,
          1,
          formattedDate
        );
        
        // Enregistre le message dans la base de données
        await MessageStats.set(newMessage)

      } catch (error) {

        console.error(`❌ Impossible de mettre à jour les stats de messages : ${error}`)
        errorLogs("Erreur lors de la mise à jour des stats de messages", `👤 tag : ${message.author.username} (ID: ${message.author.id}) \n ${error}`, message.client)

      }

    } catch (error) {

      console.error(`❌ Impossible d'exécuter l\'événement OnMessageCreate : ${error}`)
      errorLogs("Erreur lors de l'événement OnMessageCreate", `👤 tag : ${message.author.username} (ID: ${message.author.id}) \n ${error}`, message.client)
      
    }
  },
}
