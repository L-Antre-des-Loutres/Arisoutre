import { Client } from "discord.js"
import { getAllMembers } from "../handlers/user/getAllMembers"
import {UtilisateursBadges} from "./badges/utilisateursBadges";

export async function task(client : Client, guildId : string) {


    // Lancement de la tâche périodique
    await getAllMembers(client, guildId)

    // Lancement de l'obtention des badges des utilisateurs
    await UtilisateursBadges.init(client)

    setInterval(async () => {
        
        // Enregistrement des membres dans la base de données
        console.log("Lancement de l'enregistrement des membres dans la base de données")
        await getAllMembers(client, guildId)

    }, 1000 * 60 * 60 * 24) // Chaque jour à 00:00:00
            

}