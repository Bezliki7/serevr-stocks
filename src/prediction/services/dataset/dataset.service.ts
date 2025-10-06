import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs-extra';
import { parse } from 'date-fns';
import { createHash } from 'crypto';

import { DATASET_DIR, FILE_ENCODING, HASH } from './dataset.constant';

@Injectable()
export class DatasetService implements OnModuleInit {
  private dataByFile: Record<string, string> = {};

  constructor(private readonly db: PrismaClient) {}

  public async onModuleInit() {
    const files = await fs.readdir(DATASET_DIR);

    const isDifferent = await this.compareHashesForDataset(files);

    if (isDifferent) {
      await Promise.all(files.map((file) => this.saveDataset(file)));
    }
  }

  public async compareHashesForDataset(files: string[]) {
    let isDifferent = false;

    const sorted = files.sort((a, b) => a.localeCompare(b));

    const dataHash = createHash(HASH.ALGORITHM);

    for (const file of sorted) {
      const filePath = `${DATASET_DIR}${file}`;

      const content = await fs.readFile(filePath, FILE_ENCODING);
      this.dataByFile[file] = content;
      dataHash.update(content);
    }

    const stringDataHash = dataHash.digest('hex');

    const isHashExist = await fs.exists(HASH.PATH);

    if (isHashExist) {
      const oldDataHash = (await fs.readFile(HASH.PATH)).toString();

      if (oldDataHash !== stringDataHash) {
        isDifferent = true;

        await fs.writeFile(HASH.PATH, stringDataHash);
      }
    } else {
      isDifferent = true;
      await fs.writeFile(HASH.PATH, stringDataHash);
    }
    return isDifferent;
  }

  private async saveDataset(filePath: string): Promise<void> {
    try {
      const data = this.dataByFile[filePath];
      const lines = data.split('\n');

      for (let i = 3; i < lines.length; i++) {
        if (!lines[i]) return;

        const arrOfData = lines[i].split(',');
        const name = arrOfData[0];
        const index = arrOfData[4];
        const formatedIndex =
          index !== 'null' ? index : lines[i - 1].split(',')[4];
        const formatedYear = arrOfData[2].split('/')[2].padStart(4, '20');
        const formatedDate = arrOfData[2].slice(0, 6) + formatedYear;
        const isoDateString = parse(formatedDate, 'dd/MM/yyyy', 0);
        await this.db.stocks.create({
          data: {
            name,
            date: isoDateString,
            index: formatedIndex,
          },
        });
      }
    } catch (error) {
      console.error('Error saving dataset:', error);
    }
  }
}
