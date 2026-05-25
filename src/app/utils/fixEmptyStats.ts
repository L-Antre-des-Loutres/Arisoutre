import { otterlogs } from "../../otterbots/utils/otterlogs";

/**
 * Script de maintenance pour initialiser les statistiques des utilisateurs qui n'en ont pas encore.
 * Il crée une entrée de stats à 0 pour aujourd'hui pour chaque utilisateur sans stats.
 */
export async function fixEmptyStats() {
    otterlogs.log("Le script fixEmptyStats est désactivé car nous ne souhaitons plus créer de statistiques vides.");
}
