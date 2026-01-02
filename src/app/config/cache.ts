// On initialise Ottercache
import {OtterCache} from "../../otterbots/utils/ottercache/ottercache";
import {ChannelActivity, DiscordUser} from "../types/UtilisateursDiscordStatsType";

/**
 * Caches configuration.
 * Here we define the cache we want to use.
 * @type {OtterCache}
 */

export const nbMessageCache: OtterCache<number> = new OtterCache("nbMessage")
export const vocalTimeCache: OtterCache<number> = new OtterCache("vocalTime")
export const lastActivityCache: OtterCache<string> = new OtterCache("lastActivity")
export const textChannelCache: OtterCache<ChannelActivity[]> = new OtterCache("textChannels")
export const voiceChannelCache: OtterCache<ChannelActivity[]> = new OtterCache("voiceChannels")
export const vocalWithCache: OtterCache<DiscordUser[]> = new OtterCache("vocalWith")