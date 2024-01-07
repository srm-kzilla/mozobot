import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  GUILD_ID: z.string(),
  NODE_ENV: z.string().optional().default("development"),
  DATABASE_URI: z.string(),
});

export const env = envSchema.parse(process.env);
export type EnvSchemaType = z.infer<typeof envSchema>;

export default {
  botToken: env.DISCORD_TOKEN,
  clientID: env.DISCORD_CLIENT_ID,
  guildID: env.GUILD_ID,
  nodeEnv: env.NODE_ENV,
  dbUri: env.DATABASE_URI,
};
