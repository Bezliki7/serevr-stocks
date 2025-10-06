import { join } from 'node:path';

export const HASH = {
  PATH: join(process.cwd(), 'assets/hash/dataset.hash'),
  ALGORITHM: 'md5',
  ENCODING: 'hex',
} as const;

export const FILE_ENCODING = 'utf-8';

export const DATASET_DIR = 'assets/dataset/';
