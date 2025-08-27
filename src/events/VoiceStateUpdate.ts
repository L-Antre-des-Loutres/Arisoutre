import {Client, Events, VoiceState} from "discord.js";
import { errorLogs } from "../utils/message/logs/errorLogs";
import Utilisateurs_discord from "../database/Models/Utilisateurs_discord";
import {eventLogger} from "./logs/EventLogger";

// Map pour stocker le temps cumulé en ms
const voiceTimes: Map<string, number> = new Map();
// Map pour stocker l'heure d'entrée dans le vocal
const joinTimestamps: Map<string, number> = new Map();

// Fonction pour sauvegarder dans la DB en heures décimales
async function saveVoiceTime(userId: string, totalMs: number) {
    try {
        const hoursDecimal = totalMs / 1000 / 60 / 60; // conversion en heures décimales
        await Utilisateurs_discord.addVocalTime(userId, hoursDecimal);
        eventLogger(`[SAVE] Temps vocal de ${userId} sauvegardé : ${hoursDecimal.toFixed(2)}h`, "voiceStateUpdate");
    } catch (error) {
       eventLogger("Erreur saveVoiceTime: " + error, "voiceStateUpdate");
    }
}

// Flush périodique toutes les 5 minutes
setInterval(async () => {
    try {
        const now = Date.now();

        for (const [userId, joinTime] of joinTimestamps.entries()) {
            const elapsed = now - joinTime;
            const total = (voiceTimes.get(userId) || 0) + elapsed;

            await saveVoiceTime(userId, total);

            // Mettre à jour les maps
            joinTimestamps.set(userId, now);
            voiceTimes.set(userId, total);

            eventLogger(`[FLUSH] Mise à jour de l'utilisateur ${userId} : ${total}ms`, "voiceStateUpdate");
        }

    } catch (err) {
        eventLogger("Erreur sur le flush périodique: " + err, "voiceStateUpdate")
    }
}, 5 * 60 * 1000);

export default {
    name: Events.VoiceStateUpdate,
    async execute(oldState: VoiceState, newState: VoiceState, client: Client) {
        const userId = newState.id;

        try {
            // Entrée dans un canal vocal
            if (!oldState.channel && newState.channel) {
                joinTimestamps.set(userId, Date.now());
                eventLogger(`[JOIN] ${userId} a rejoint le canal vocal ${newState.channel.id}`, "voiceStateUpdate");
            }

            // Sortie d’un canal vocal
            if (oldState.channel && !newState.channel) {
                const joinTime = joinTimestamps.get(userId);
                if (joinTime) {
                    const elapsed = Date.now() - joinTime;
                    voiceTimes.set(userId, (voiceTimes.get(userId) || 0) + elapsed);
                    joinTimestamps.delete(userId);

                    eventLogger(`[LEAVE] ${userId} a quitté le canal vocal ${oldState.channel.id}, temps passé: ${elapsed}ms`, "voiceStateUpdate");

                    // Sauvegarde immédiate en heures décimales
                    await saveVoiceTime(userId, voiceTimes.get(userId)!);
                }
            }

            // Changement de canal vocal
            if (
                oldState.channel &&
                newState.channel &&
                oldState.channel.id !== newState.channel.id
            ) {
                const joinTime = joinTimestamps.get(userId);
                if (joinTime) {
                    const elapsed = Date.now() - joinTime;
                    voiceTimes.set(userId, (voiceTimes.get(userId) || 0) + elapsed);
                    eventLogger(`[MOVE] ${userId} a changé de canal ${oldState.channel.id} -> ${newState.channel.id}, temps précédent: ${elapsed}ms`, "voiceStateUpdate");
                }
                joinTimestamps.set(userId, Date.now());
            }
        } catch (err) {
            errorLogs(`Erreur VoiceStateUpdate pour ${userId}`, "", client);
        }
    },
};
