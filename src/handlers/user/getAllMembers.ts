import { Client } from 'discord.js';
import UtilisateursDiscord from '../../database/Models/Utilisateurs_discord';

export async function getAllMembers(client: Client, guildId: string): Promise<void> {
    try {
        const guild = await client.guilds.fetch(guildId);
        const members = await guild.members.fetch();

        // Connexion à la base de données

        // Enregistre les membres dans la base de données
        members.forEach(async member => {
            // Affiche les informations sur le membre
            // console.log(`👤 tag : ${member.user.username} (ID: ${member.id})  pseudo d'affichage : ${member.user.displayName}, ${member.user.bot}`);

            // Vérifie si le membre est un bot
            if (member.user.bot) return;

            // Transforme la date de join en format SQL
            const joinDate = member.joinedAt?.toISOString().slice(0, 19).replace('T', ' ') ?? '0000-00-00 00:00:00';

            // Enregistre le membre dans la base de données
            UtilisateursDiscord.register(new UtilisateursDiscord(member.id, member.user.username, joinDate));

        });
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des membres :", error);
        return;
    }
}
