/**
 * Calculates a Discord activity score based on the number of messages sent and the time spent in voice activity.
 *
 * 1 message = 0.75 point
 *
 * vocal calcul à revoir !
 *
 * @param {number} nbMessage - The number of messages sent by the user. If less than or equal to 0, it is treated as 0.
 * @param {number} tmpsVocal - The time spent in voice channels by the user. If less than or equal to 0, it is treated as 0.
 * @return {Promise<number>} A promise that resolves to the total activity score calculated by summing the points for messages and voice time.
 */

export async function discordActivityScore(nbMessage: number, tmpsVocal: number): Promise<number> {

    // Vérification des valeurs du nombre de messages
    if (!nbMessage) {
        nbMessage = 0;
    }

    // Vérification des valeurs de temps vocal
    if (!tmpsVocal) {
        tmpsVocal = 0;
    }

    // Formule de point pour les messages
    const msgPoints = calculMsgPoints(nbMessage);
    const vocPoints = calculVocPoints(tmpsVocal);

    return Math.round(msgPoints + vocPoints)
}

function calculMsgPoints(msgValeur: number): number {
    const echelle = 0.45;
    const saturation = 0.9;
    return echelle * Math.pow(msgValeur, saturation);
}

function calculVocPoints(nbHeures: number): number {
    const echelle = 2.5;
    const saturation = 0.9;
    return echelle * Math.pow(nbHeures, saturation);
}