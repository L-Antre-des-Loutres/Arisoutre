import {Client, Events, VoiceState} from "discord.js";
import { otterlogs } from "../../otterbots/utils/otterlogs";
import {lastActivityCache, vocalTimeCache, vocalWithCache, voiceChannelCache} from "../config/cache";
import { hasNoDataRole } from "../utils/no_data";
import { joinTimestamps, voiceTimes } from "../utils/voiceState";
import { getSqlDate } from "../utils/sqlDate";

// Fonction pour sauvegarder en cache le channel vocal
export async function saveVoiceChannel(voiceState: VoiceState, userId: string, vocalTimeMs?: number) {
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
            {
                name: voiceState.channel.name,
                id: voiceState.channel.id,
                vocal_time: (vocalTimeMs ? vocalTimeMs / 1000 / 60 / 60 : 0)
            }
        ]);
    } else if (vocalTimeMs) {
        // Si le channel existe déjà, on met à jour le temps vocal
        const updatedChannels = userChannels.map(channel => {
            if (channel.id === voiceState.channel?.id) {
                const currentTime = channel.vocal_time || 0;
                return {
                    ...channel,
                    vocal_time: currentTime + (vocalTimeMs / 1000 / 60 / 60) // Ajouter le temps en heures
                };
            }
            return channel;
        });

        voiceChannelCache.set(userId, updatedChannels);
    }
}

// Fonction pour mettre à jour les interactions entre utilisateurs (vocal_with)
export async function updateVocalWith(voiceState: VoiceState, userId: string) {
    if (!voiceState.channel || !("name" in voiceState.channel)) {
        return;
    }

    // Liste des autres membres présents dans le salon (exclut les bots et soi-même)
    const otherUsers = voiceState.channel.members
        .filter(member => member.id !== userId && !member.user.bot)
        .map(member => ({
            id: member.id,
            username: member.user.username
        }));

    if (otherUsers.length === 0) return;

    // 1. Mise à jour pour celui qui rejoint (il enregistre tous ceux présents)
    const rawVocalWith = vocalWithCache.get(userId);
    const userVocalWith = Array.isArray(rawVocalWith) ? rawVocalWith : [];
    
    const newForUser = otherUsers.filter(other => 
        !userVocalWith.some(existing => existing.id === other.id)
    );

    if (newForUser.length > 0) {
        vocalWithCache.set(userId, [...userVocalWith, ...newForUser]);
    }

    // 2. Mise à jour réciproque pour ceux déjà présents (ils enregistrent celui qui arrive)
    otherUsers.forEach(otherUser => {
        const rawOtherVocalWith = vocalWithCache.get(otherUser.id);
        const otherVocalWith = Array.isArray(rawOtherVocalWith) ? rawOtherVocalWith : [];

        if (!otherVocalWith.some(existing => existing.id === userId)) {
            vocalWithCache.set(otherUser.id, [
                ...otherVocalWith,
                {
                    id: userId,
                    username: voiceState.member?.user.username || 'Unknown'
                }
            ]);
        }
    });
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
                await updateVocalWith(newState, userId);
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
                    await saveVoiceChannel(oldState, userId, (elapsed || 0));
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
                    await saveVoiceChannel(oldState, userId, (elapsed || 0));
                    await saveVoiceChannel(newState, userId);
                    await updateVocalWith(newState, userId);
                }

                // Redémarrer le compteur à partir du nouveau canal
                joinTimestamps.set(userId, Date.now());
            }
        } catch (err) {
            otterlogs.error(`Erreur VoiceStateUpdate pour ${userId}` + err + client);
        }
    },
};