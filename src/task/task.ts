import { Client } from "discord.js"
import { getAllMembers } from "../handlers/user/getAllMembers"
import { VocalStats } from "../utils/localData/vocalStats"

export async function task(client : Client, guildId : string) {

    // Affichage du nombre d'heure de vocal total d'un utilisateur
    VocalStats.getTotalVocalTime("383676607434457088").then((vocalTime) => {
        console.log(vocalTime)
    })

    // Lancement de la tâche périodique
    await getAllMembers(client, guildId)
    setInterval(async () => {
        
        // Enregistrement des membres dans la base de données
        console.log("Lancement de l'enregistrement des membres dans la base de données")
        await getAllMembers(client, guildId)

    }, 1000 * 60 * 60 * 24) // Chaque jour à 00:00:00
            

}