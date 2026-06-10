import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const bannerPath = join(dirname(fileURLToPath(import.meta.url)), 'banner.webp');

export function readBannerWebp(): Buffer {
  return readFileSync(bannerPath);
}
