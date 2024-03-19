import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  GUILD_ID: z.string(),
  NODE_ENV: z.string().optional().default("development"),
  DATABASE_URI: z.string(),
  MOD_CHANNEL_ID: z.string(),
  MOD_ROLE_ID: z.string(),
});

const env = envSchema.parse(process.env);
export type EnvSchemaType = z.infer<typeof envSchema>;

export default {
  BOT_TOKEN: env.DISCORD_TOKEN,
  CLIENT_ID: env.DISCORD_CLIENT_ID,
  GUILD_ID: env.GUILD_ID,
  NODE_ENV: env.NODE_ENV,
  DB_URI: env.DATABASE_URI,
  MOD_CHANNEL_ID: env.MOD_CHANNEL_ID,
  MOD_ROLE_ID: env.MOD_ROLE_ID,
};
