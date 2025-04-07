export interface VocalStatsInterface {
    discord_id: string,
    channel_id: string,
    session_id: string,
    join_date: Date,
    leave_date?: Date,
    session_id: string

}

export interface MessageStatsInterface {
    discord_id: string,
    channel_id: string,
    number_of_messages: number,
}
