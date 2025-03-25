import { Events, Message } from "discord.js"

export default {
  name: Events.MessageCreate,
  async execute(message: Message) {
    if (message.author.bot) return

    // Convertir le contenu du message en minuscules
    const messageContent = message.content.toLowerCase()

    if (messageContent.includes("ratio")) {
      // Votre code à exécuter si le message contient 'ratio'
      message.react("👻")
    }
  },
}
