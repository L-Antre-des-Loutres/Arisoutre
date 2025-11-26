export type UtilisateursDiscordType = {
    id: number
    discord_id: string
    pseudo_discord: string
    join_date_discord: string
    first_activity: string
    last_activity: string
    nb_message: number
    tag_discord: string
    avatar_url: string
    vocal_time : number
    roles: Roles[]
    delete_date: string | null;
}

export type Roles = {
    id: string;
    name: string;
    color: string;
}