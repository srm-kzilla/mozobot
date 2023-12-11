import { glob } from 'glob';
import * as path from 'path';
import { DiscordClient } from '../internal/discordClient';

export async function getFiles(client: DiscordClient, dir: string): Promise<string[]> {
  let files: string[] = [];
  files = (await glob(`build/${dir}/**/*.js`)).map(file => path.resolve(file));
  console.log(`Found ${files.length} files in ${dir}`);

  return files;
}
