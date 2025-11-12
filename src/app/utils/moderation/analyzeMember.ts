import {GuildMember} from "discord.js";

/**
 * Analyzes a given guild member's profile and activity to determine their trustworthiness.
 *
 * @param {GuildMember} member The guild member to analyze.
 * @return {Object} An analysis object containing:
 * - `score` {number}: The calculated trust score ranging from 0 to 100.
 * - `verdict` {string}: A textual assessment of the member's trust level.
 * - `color` {number}: A color code representing the assessment (e.g., green, yellow, red).
 * - `notes` {string[]}: An array of notes providing details about the analysis.
 */
export function analyzeMember(member: GuildMember): {
    score: number;
    verdict: string;
    color: number;
    notes: string[];
} {
    const user = member.user;

    const now = Date.now();
    const accountAgeDays = Math.floor((now - user.createdTimestamp) / (1000 * 60 * 60 * 24));
    const joinAgeDays = member.joinedTimestamp
        ? Math.floor((now - member.joinedTimestamp) / (1000 * 60 * 60 * 24))
        : 0;

    let score = 100;
    const notes: string[] = [];

    // ----------------------------
    // 1. Analyse de base
    // ----------------------------
    if (user.bot) {
        score -= 25;
        notes.push("Le compte est un bot.");
    }

    if (accountAgeDays < 7) {
        score -= 30;
        notes.push("Compte très récent (moins de 7 jours).");
    } else if (accountAgeDays < 30) {
        score -= 15;
        notes.push("Compte jeune (moins d’un mois).");
    }

    const hasDefaultAvatar = user.displayAvatarURL().includes("embed/avatars/");
    if (hasDefaultAvatar) {
        score -= 20;
        notes.push("Utilise une photo de profil par défaut.");
    }

    if (joinAgeDays < 1) {
        score -= 10;
        notes.push("A rejoint le serveur très récemment (moins de 24h).");
    } else if (joinAgeDays < 7) {
        score -= 5;
        notes.push("Membre depuis moins d’une semaine.");
    }

    // Compte créé juste avant de rejoindre le serveur
    const diff = member.joinedTimestamp && (member.joinedTimestamp - user.createdTimestamp);
    if (diff && diff < 24 * 60 * 60 * 1000) {
        score -= 10;
        notes.push("Compte créé peu avant de rejoindre le serveur.");
    }


    // ----------------------------
    // 2. Analyse avancée (inactive pour nouveaux membres)
    // ----------------------------
    const eligibleForAdvanced = joinAgeDays >= 3; // Analyse complète après 3 jours de présence

    if (eligibleForAdvanced) {
        // Aucun rôle attribué (autre que @everyone)
        if (member.roles.cache.size < 2) {
            score -= 10;
            notes.push("Aucun rôle attribué sur le serveur.");
        }

        // Pas de présence détectée
        if (!member.presence) {
            score -= 5;
            notes.push("Aucune activité ou présence détectée.");
        }

        // Boosteur du serveur
        if (member.premiumSince) {
            score += 10;
        }

        if (/^user\d{4}$/i.test(user.username)) {
            score -= 10;
            notes.push("Nom d’utilisateur générique détecté.");
        }
    }

    // ----------------------------
    // 🧾 3. Résultat final
    // ----------------------------
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    let verdict = "✅ Utilisateur fiable";
    let color = 0x2ecc71; // vert

    if (score < 60) {
        verdict = "⚠️ Utilisateur suspect";
        color = 0xf1c40f; // jaune
    }
    if (score < 30) {
        verdict = "🚨 À surveiller de près";
        color = 0xe74c3c; // rouge
    }

    return { score, verdict, color, notes };
}
