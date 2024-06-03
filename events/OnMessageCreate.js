const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

         // Convertir le contenu du message en minuscules
         const messageContent = message.content.toLowerCase();

         if (messageContent.includes('ratio')) {
            // Votre code à exécuter si le message contient 'Coucou'
            message.react('👻');
        }
    }};