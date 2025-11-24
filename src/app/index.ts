import {Otterbots} from "../otterbots";
import {cacheRegister} from "./tasks/cacheRegister";

// Get bot instance
const bot = new Otterbots();

// Start the bot
bot.start();
bot.setActivity("watching", " Watching: Ottergames")
bot.startOtterGuard()

// Start tasks (if you not use tasks, you can delete this)
bot.initTask()

cacheRegister()
