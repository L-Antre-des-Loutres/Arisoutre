import {Otterbots} from "../otterbots";
import {Client} from "discord.js";
import {registerAllMember} from "./tasks/registerAllMember";

// Get bot instance
const bot = new Otterbots();

// Start the bot
bot.start();
bot.setActivity("watching", " Watching: Ottergames")
bot.startOtterGuard()

// Start tasks (if you not use tasks, you can delete this)
bot.initTask()

registerAllMember()

/**
 * Retrieves the client instance used by the bot.
 *
 * @return {Object} The client instance associated with the bot.
 */
export function getClient(): Client {
    return bot.getClient();
}