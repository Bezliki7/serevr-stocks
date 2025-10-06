import { Injectable } from '@nestjs/common';
import { Portfolio, PrismaClient } from '@prisma/client';
import * as fs from 'fs-extra';
import { compareAsc } from 'date-fns';

import type { Response } from 'express';

import { CONVERT_PERIOD_TYPE } from './prediction.constant';

import type { CreatePortfolioDto } from '../../dtos/create-portfolio.dto';
import type { UpdatePortfolio } from '../../dtos/update-portfolio.dto';

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
            deleteMany: {},
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

  public async getMoexIndexesByPeriod(startDate: Date, endDate: Date) {
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

    return stocks.sort((a, b) => compareAsc(a.date, b.date));
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
