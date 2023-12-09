import {Client, Events} from "discord.js";
import {config} from "dotenv";

config()
const token = process.env.DISCORD_TOKEN || "";
const client = new Client({intents: 32767});

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);