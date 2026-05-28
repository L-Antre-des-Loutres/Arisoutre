/**
 * Represents the statistics of a Discord user.
 *
 * @typedef {Object} UtilisateursDiscordStatsType
 *
 * @pocketbase {Collection} - discord_user_stats
 *
 * @property {string} id - The unique identifier for the stats entry.
 * @property {string} discord_user - The unique identifier of the user (PocketBase ID).
 * @property {number} message_count - The total number of messages sent by the user.
 * @property {number} vocal_time - The total time the user spent in voice channels, measured in decimal hours.
 * @property {string} date_stats - The date the statistics are recorded, in ISO 8601 format (YYYY-MM-DD).
 * @property {ChannelActivity[]} voice_channels - A list of voice channels where the user has participated.
 * @property {ChannelActivity[]} text_channels - A list of text channels where the user has sent messages.
 */
export type UtilisateursDiscordStatsType = {
    id: string
    discord_user: string
    message_count: number
    vocal_time: number
    date_stats: string
    voice_channels?: ChannelActivity[]
    text_channels?: ChannelActivity[]
    vocal_with?: DiscordUser[]
    date_stat: string
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