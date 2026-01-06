/**
 * Represents the statistics of a Discord user.
 *
 * @typedef {Object} UtilisateursDiscordStatsType
 *
 * @property {number} id - The unique identifier for the stats entry.
 * @property {number} id_utilisateur - The unique identifier of the user.
 * @property {number} nb_message - The total number of messages sent by the user.
 * @property {number} vocal_time - The total time the user spent in voice channels, measured in seconds.
 * @property {string} date_stats - The date the statistics are recorded, in ISO 8601 format.
 * @property {Channel[]} voice_channels - A list of voice channels where the user has participated.
 * @property {Channel[]} text_channels - A list of text channels where the user has sent messages.
 */
export type UtilisateursDiscordStatsType = {
    id: number
    id_utilisateur: number
    nb_message: number
    vocal_time: number
    date_stats: string
    voice_channels?: ChannelActivity[]
    text_channels?: ChannelActivity[]
    vocal_with?: DiscordUser[]
}

/**
 * Represents a communication channel with a unique identifier and name.
 *
 * @typedef {Object} Channel
 * @property {string} id - The unique identifier for the channel.
 * @property {string} name - The display name of the channel.
 */
export type ChannelActivity = {
    id: string,
    name: string
    nb_message?: number
    vocal_time?: number
}

/**
 * Represents a Discord user.
 *
 * This interface defines the basic structure of a Discord user,
 * including their unique identifier and username.
 *
 * Properties:
 * - `id` (string): The unique identifier for the Discord user.
 * - `username` (string): The display name chosen by the Discord user.
 */
export interface DiscordUser {
    id: string,
    username: string
}