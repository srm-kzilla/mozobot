import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const templateSchema = z.object({
  _id: z.custom(value => value instanceof ObjectId),
  title: z.string(),
  description: z.string(),
  guildId: z.string(),
  isDeleted: z.boolean(),
});

export type templateSchemaType = z.infer<typeof templateSchema>;
