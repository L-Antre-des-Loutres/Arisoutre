import { Events, EmbedBuilder, Message, TextChannel } from "discord.js";

export default {
  name: Events.MessageDelete,
  async execute(message: Message) {
    // Vérifie si le message a été supprimé par un bot ou s'il est vide
    if (!message.author || message.author.bot) return;

    // Déclaration des variables
    const messageChannel: string = message.channel instanceof TextChannel ? message.channel.name : "Inconnu";
    const deletedMessage: string = message.content || "Aucun contenu (peut contenir un média ou une pièce jointe)";
    const user: string = message.author.tag;
    const userPdp: string = message.author.displayAvatarURL();

    // Récupère le salon de logs dans lequel envoyer le message
    const channelName = "🍜logs-edit-suppression";
    const logChannel = message.guild?.channels.cache.find(
      (ch) => ch.name === channelName && ch instanceof TextChannel
    ) as TextChannel | undefined;

    if (!logChannel) {
      console.error(`❌ Channel "${channelName}" non trouvé`);
      return;
    }

    try {
      // Crée un embed pour le message supprimé
      const embed = new EmbedBuilder()
        .setAuthor({
          name: `Suppression d'un message dans : #${messageChannel}`,
        })
        .setTitle(`Par : **${user}**`)
        .setDescription(`🗑 **Message supprimé** :\n\`\`\`\n${deletedMessage}\n\`\`\``)
        .setThumbnail(userPdp)
        .setColor("#f50000")
        .setFooter({ text: "Arisoutre" })
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`❌ Impossible d'envoyer le message : ${error}`);
    }
  },
};
