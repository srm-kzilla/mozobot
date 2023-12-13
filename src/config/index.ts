import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  DISCORD_TOKEN: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  TEST_GUILD_ID: z.string(),
});

export const env = envSchema.parse(process.env);
export type envSchemaType = z.infer<typeof envSchema>;

export default {
  botToken: env.DISCORD_TOKEN,
  clientID: env.DISCORD_CLIENT_ID,
  testGuildID: env.TEST_GUILD_ID,
};
