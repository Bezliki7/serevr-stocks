import { Injectable } from '@nestjs/common';
import { Portfolio, PrismaClient } from '@prisma/client';
import * as fs from 'fs-extra';
import { compareAsc, parse } from 'date-fns';

import type { Response } from 'express';

import { CONVERT_PERIOD_TYPE } from './prediction.constant';

import type { CreatePortfolioDto } from '../dtos/create-portfolio.dto';
import type { UpdatePortfolio } from '../dtos/update-portfolio.dto';

@Injectable()
export class PredictionService {
  constructor(private readonly db: PrismaClient) {}

  public async createPortfolio(dto: CreatePortfolioDto) {
    try {
      const portfolio = await this.db.portfolio.create({
        data: {
          name: dto.name,
          dateOfCreation: dto.dateOfCreation,
          isMoreRisk: dto.isMoreRisk,
          startDate: dto.startDate,
          endDate: dto.endDate,
          periodType: CONVERT_PERIOD_TYPE.TO_BD[dto.periodType],
          predictions: {
            createMany: {
              data: dto.predictions,
            },
          },
        },
      });

      return this.normalize(portfolio);
    } catch (error) {
      console.error(error);
    }
  }

  public async getPortfolios() {
    try {
      const portfolios = await this.db.portfolio.findMany({
        include: {
          predictions: true,
        },
      });

      const normalizedData = portfolios.map((portfolio) =>
        this.normalize(portfolio),
      );

      return normalizedData;
    } catch (error) {
      console.error(error);
    }
  }

  public async updatePortfolio(id: number, dto: UpdatePortfolio) {
    try {
      const updatedPortfolio = await this.db.portfolio.update({
        where: {
          id,
        },
        data: {
          ...dto,
          periodType: CONVERT_PERIOD_TYPE.TO_BD[dto.periodType],
          predictions: {
            createMany: {
              data: dto.predictions,
            },
          },
        },
      });

      return this.normalize(updatedPortfolio);
    } catch (error) {
      console.error(error);
    }
  }

  public async deletePortfolio(id: number) {
    try {
      await this.db.portfolio.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }

  public normalize(rawData: Portfolio) {
    return {
      ...rawData,
      periodType: CONVERT_PERIOD_TYPE.FROM_BD[rawData.periodType],
    };
  }

  public async initialize() {
    const files = await fs.readdir(`assets/dataset/`);

    files.map((file) => {
      this.saveDataset(file);
    });
  }

  public async getMoexIndexesByPeriod(startDate: Date, endDate: Date) {
    const s = await this.db.stocks.findMany();

    const data = await this.db.stocks.findMany({
      where: { date: { gte: startDate, lte: endDate }, name: 'IMOEX' },
    });
    const sortedData = data.sort((a, b) => compareAsc(a.date, b.date));
    return sortedData;
  }

  public async getStocks() {
    const stocks = await this.db.stocks.findMany({
      where: {
        NOT: {
          name: 'IMOEX',
        },
        date: { gte: new Date('2022-01-01') },
      },
    });

    return stocks
      .filter(({ index }) => index.length > 1 && !index.startsWith('0'))
      .sort((a, b) => compareAsc(a.date, b.date));
  }

  private async saveDataset(filePath: string): Promise<void> {
    try {
      const data = await fs.readFile(`assets/dataset/${filePath}`, 'utf8');
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
      console.error('Error importing data:', error);
    }
  }

  public async getModel() {
    const json = JSON.parse(
      (await fs.readFile('assets/models/model.json')).toString(),
    );
    return json;
  }

  public async getModelBin(res: Response) {
    const file = await fs.readFile('assets/models/model.weights.bin');

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', file.length);

    res.end(file);
  }
}
