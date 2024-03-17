import { Injectable } from '@nestjs/common';
import { stocks } from '@prisma/client';
import * as fs from 'fs-extra';

import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    // this.importDataFromFile(
    //   'C:\\Users\\Bezlikiy\\Documents\\stocks\\server\\src\\data\\IMOEX.ME.csv',
    // );

    return 'server!';
  }

  async getMoexIndexesByPeriod(startDate: Date, endDate: Date) {
    const s = await this.prisma.stocks.findMany();
    console.log(s);
    const data = await this.prisma.stocks.findMany({
      where: { date: { gte: startDate, lte: endDate } },
    });

    return data;
  }

  private async importDataFromFile(filePath: string): Promise<void> {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const lines = data.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const arrOfData = lines[i].split(',');

        const formatedIndex =
          arrOfData[4] !== 'null' ? arrOfData[4] : lines[i - 1].split(',')[4];

        const isoDateString = new Date(
          `${arrOfData[0]}T00:00:00Z`,
        ).toISOString();

        console.log({
          date: isoDateString,
          index: formatedIndex,
        });

        await this.prisma.stocks.create({
          data: {
            date: isoDateString,
            index: formatedIndex,
          },
        });
      }
    } catch (error) {
      console.error('Error importing data:', error);
    }
  }
}
