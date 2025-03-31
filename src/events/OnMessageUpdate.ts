import { Events, EmbedBuilder, Message, TextChannel } from "discord.js"
import { errorLogs } from "../utils/message/logs/errorLogs"

export default {
  name: Events.MessageUpdate,
  async execute(oldMessage: Message, newMessage: Message) {
    
    try {

      if (oldMessage.author.bot) return

      // Vérifie si le message a été édité par un bot ou si le contenu n'a pas changé
      if (!oldMessage.author || oldMessage.author.bot || oldMessage.content === newMessage.content) return

      // Vérifie que le channel est un salon textuel
      if (!(oldMessage.channel instanceof TextChannel)) return

      // Déclaration des variables
      const messageChannel: string = oldMessage.channel.name
      const oldContent: string = oldMessage.content || "Aucun contenu"
      const newContent: string = newMessage.content || "Aucun contenu"
      const user: string = oldMessage.author.tag
      const userPdp: string = oldMessage.author.displayAvatarURL()

      // Récupère le salon de logs dans lequel envoyer le message
      const channelName = "🍜logs-edit-suppression"
      const logChannel = oldMessage.guild?.channels.cache.find(
        (ch) => ch.name === channelName && ch instanceof TextChannel
      ) as TextChannel | undefined

      if (!logChannel) {
        console.error(`❌ Channel "${channelName}" non trouvé`)
        return
      }

      try {
        // Crée un embed pour le message édité
        const embed = new EmbedBuilder()
          .setAuthor({ name: `✏️ Édition de message dans : #${messageChannel}` })
          .setTitle(`Par : **${user}**`)
          .setDescription(
            `✏ **Avant** :\n\`\`\`${oldContent}\`\`\`\n🔄 **Après** :\n\`\`\`${newContent}\`\`\``
          )
          .setThumbnail(userPdp)
          .setColor("#cbcccd")
          .setFooter({ text: "Arisoutre" })
          .setTimestamp()

        await logChannel.send({ embeds: [embed] })
      } catch (error) {
        console.error(`❌ Impossible d'envoyer le message : ${error}`)
      }
    }
    catch (error) {
      console.error(`❌ Impossible d'exécuter l\'événement OnMessageUpdate : ${error}`)
      errorLogs("Erreur lors de l'événement OnMessageUpdate", `👤 tag : ${oldMessage.author.username} (ID: ${oldMessage.author.id}) \n ${error}`, oldMessage.client)
    }
  },
}
