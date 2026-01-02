// On initialise Ottercache
import {OtterCache} from "../../otterbots/utils/ottercache/ottercache";
import {ChannelActivity} from "../types/UtilisateursDiscordStatsType";

/**
 * Caches configuration.
 * Here we define the cache we want to use.
 * @type {OtterCache}
 */

export const nbMessageCache: OtterCache<number> = new OtterCache("nbMessage")
export const vocalTimeCache: OtterCache<number> = new OtterCache("vocalTime")
export const lastActivityCache: OtterCache<string> = new OtterCache("lastActivity")
export const text_channels: OtterCache<ChannelActivity[]> = new OtterCache("text_channels")
export const voice_channels: OtterCache<ChannelActivity[]> = new OtterCache("voice_channels")