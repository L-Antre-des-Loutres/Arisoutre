import { Events, VoiceState } from "discord.js";

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldState: VoiceState, newState: VoiceState) {

        // Gestion de l'événement de mise à jour de statut vocal
        try {
            // Quand un utilisateur rejoint un salon vocal
            try {
                if (!oldState.channel && newState.channel) {
                    if (newState.member) {
                        console.log(`${newState.member.user.tag} a rejoint le salon vocal ${newState.channel.name}`);
                    }
                }

            } catch (error) {
                console.log('Erreur lors de la récupération du statut vocal d\'un joueur (join) :', error)
            }

            // Quand un utilisateur quitte le salon vocal
            try {
                if (oldState.channel && !newState.channel) {
                    if (oldState.member) {
                        console.log(`${oldState.member.user.tag} a quitté le salon vocal ${oldState.channel.name}`);
                    }
                }
            } catch (error) {
                console.log('Erreur lors de la récupération du statut vocal d\'un joueur (leave) :', error)
            }
        } catch (error) {
            console.log('Erreur lors de la récupération du statut vocal d\'un joueur (voiceStateUpdate) :', error)
        }
    }
}
