import {Client, Events, VoiceState} from "discord.js";
import { otterlogs } from "../../otterbots/utils/otterlogs";
import {lastActivityCache, vocalTimeCache, vocalWithCache, voiceChannelCache} from "../config/cache";
import { hasNoDataRole } from "../utils/no_data";
import { joinTimestamps, voiceTimes } from "../utils/voiceState";
import { getSqlDate } from "../utils/sqlDate";

// Fonction pour sauvegarder en cache le channel vocal
export async function saveVoiceChannel(voiceState: VoiceState, userId: string) {
    // On vérifie que le channel est un channel vocal
    if (!voiceState.channel || !("name" in voiceState.channel)) {
        return;
    }

    const rawData = voiceChannelCache.get(userId);
    const userChannels = Array.isArray(rawData) ? rawData : [];
    const channelExists = userChannels.some(channel => channel.id === voiceState.channel?.id);
    if (!channelExists) {
        voiceChannelCache.set(userId, [
            ...userChannels,
            {name: voiceState.channel.name, id: voiceState.channel.id}
        ]);

        // Ajoute tous les autres utilisateurs présents dans le vocal
        const otherUsers = voiceState.channel.members
            .filter(member => member.id !== userId && !member.user.bot)
            .map(member => ({
                id: member.id,
                name: member.user.username
            }));

        const rawVocalWith = vocalWithCache.get(userId);
        const userVocalWith = Array.isArray(rawVocalWith) ? rawVocalWith : [];
        const uniqueUsers = otherUsers.filter(user =>
            !userVocalWith.some(existing => existing.id === user.id)
        );

        if (uniqueUsers.length > 0) {
            vocalWithCache.set(userId, [
                ...userVocalWith,
                ...uniqueUsers.map(user => ({
                    id: user.id,
                    username: user.name
                }))
            ]);
        }
    }
}

// Fonction pour sauvegarder dans la DB en heures décimales
async function saveVoiceTime(userId: string, deltaMs: number) {
    try {
        const hoursDelta = deltaMs / 1000 / 60 / 60;
        const currentVocalTime = vocalTimeCache.get(userId) || 0;

        // On enregistre dans le cache
        vocalTimeCache.set(userId, currentVocalTime + hoursDelta);
    } catch (error) {
        otterlogs.error("Erreur saveVoiceTime: " + error + "voiceStateUpdate");
    }
}

// Flush périodique toutes les 5 minutes
setInterval(async () => {
    try {
        const now = Date.now();

        for (const [userId, joinTime] of joinTimestamps.entries()) {
            const elapsed = now - joinTime;

            // Sauvegarder uniquement le delta (pas le total)
            await saveVoiceTime(userId, elapsed);

            // Mettre à jour les maps
            joinTimestamps.set(userId, now);
            otterlogs.debug("Periodic flush for user " + userId + ", added time: " + elapsed + " ms");
            voiceTimes.set(userId, (voiceTimes.get(userId) || 0) + elapsed);
        }
    } catch (err) {
        otterlogs.error("Erreur sur le flush périodique: " + err + "voiceStateUpdate");
    }
}, 5 * 60 * 1000);

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState: VoiceState, newState: VoiceState, client: Client) {
        const userId = newState.id;

        try {
            // On récupère le membre disponible
            const member = newState.member ?? oldState.member;
            if (!member) return;

            // On ne compte pas les bots
            if (newState.member?.user.bot) return;

            // On vérifie que l'utilisateur n'as pas le rôle no_data avant de l'enregistrer en BDD
            if (await hasNoDataRole(member)) return;

            // Mise à jour de la dernière activité
            lastActivityCache.set(userId, getSqlDate())

            // Entrée dans un canal vocal
            if (!oldState.channel && newState.channel) {
                otterlogs.debug("User " + userId + " joined voice channel " + newState.channel.id);
                joinTimestamps.set(userId, Date.now());

                // Sauvegarde du canal vocal
                await saveVoiceChannel(newState, userId);
            }

            // Sortie d’un canal vocal
            if (oldState.channel && !newState.channel) {
                const joinTime = joinTimestamps.get(userId);
                if (joinTime) {
                    const elapsed = Date.now() - joinTime;

                    // On enregistre uniquement le delta depuis le dernier flush
                    await saveVoiceTime(userId, elapsed);

                    // Mise à jour en mémoire
                    voiceTimes.set(userId, (voiceTimes.get(userId) || 0) + elapsed);
                    otterlogs.debug("User " + userId + " left voice channel " + oldState.channel.id + ", total time: " + (voiceTimes.get(userId) || 0) + " ms");
                    joinTimestamps.delete(userId);
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

                    // Sauvegarde uniquement du delta depuis le dernier flush
                    await saveVoiceTime(userId, elapsed);

                    // Mise à jour en mémoire
                    voiceTimes.set(userId, (voiceTimes.get(userId) || 0) + elapsed);

                    // Sauvegarde du canal vocal
                    await saveVoiceChannel(newState, userId);
                }

                // Redémarrer le compteur à partir du nouveau canal
                joinTimestamps.set(userId, Date.now());
            }
        } catch (err) {
            otterlogs.error(`Erreur VoiceStateUpdate pour ${userId}` + err + client);
        }
    },
};