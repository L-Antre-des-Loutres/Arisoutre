import { Collection, CommandInteraction, SlashCommandBuilder } from "discord.js";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            DISCORD_TOKEN: string;
            DISCORD_CLIENT_ID: string;
            DEV_SERVEUR: string;
        }
    }
}

declare module "discord.js" {
    export interface Client {
        slashCommands: Collection<string, SlashCommand>
    }
}

export interface Channel {
    name: string,
}

export interface BotEvent {
    name: string,
    once?: boolean | false,
    execute: (...args: any) => void
}

export interface SlashCommand {
    name: string,
    data: SlashCommandBuilder | any,
    async execute: (interaction: CommandInteraction) => Promise<void>
    async execute?: (interaction: CommandInteraction) => Promise<void>
    async autocomplete?: (interaction: CommandInteraction) => Promise<void>
}

export { };