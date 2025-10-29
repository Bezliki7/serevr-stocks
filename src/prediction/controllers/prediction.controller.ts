import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';

import { PredictionService } from '../services/prediction/prediction.service';

import type { CreatePortfolioDto } from '../dtos/create-portfolio.dto';
import type { UpdatePortfolio } from '../dtos/update-portfolio.dto';
import type { GetMoexIndexesDto } from '../dtos/get-moex-indexes.dto';

@Controller({ path: 'prediction' })
export class PredictionController {
  constructor(private readonly predictionService: PredictionService) {}

  /**
   * Создание инвестиционного портфеля
   */
  @Post('portfolio')
  public createPortfolio(@Body() dto: CreatePortfolioDto) {
    return this.predictionService.createPortfolio(dto);
  }

  /**
   * Получение списка инвестиционных портфелей
   */
  @Get('portfolios')
  public getPortfolios() {
    return this.predictionService.getPortfolios();
  }

  /**
   * Обновление инвестиционного портфеля
   */
  @Patch('portfolio/:id')
  public updatePortfolio(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePortfolio,
  ) {
    return this.predictionService.updatePortfolio(id, dto);
  }

  /**
   * Удаление инвестиционного портфеля
   */
  @Delete('portfolio/:id')
  public deletePortfolio(@Param('id', ParseIntPipe) id: number) {
    this.predictionService.deletePortfolio(id);
  }

  /**
   * Получение индекса МосБиржи за определенный период
   */
  @Put('moexes')
  public async getMoexIndexesByPeriod(
    @Body() getMoexIndexesDto: GetMoexIndexesDto,
  ) {
    const parsedStartDate = new Date(getMoexIndexesDto.startDate);
    const parsedEndDate = new Date(getMoexIndexesDto.endDate);

    return this.predictionService.getMoexIndexesByPeriod(
      parsedStartDate,
      parsedEndDate,
    );
  }

  /**
   * Получение всех акций
   */
  @Get('stocks')
  public getStocks() {
    return this.predictionService.getStocks();
  }

  /**
   * Получение модели для предсказания
   */
  @Get('model')
  public getModel() {
    return this.predictionService.getModel();
  }

  /**
   * Получение бинарного файла весов модели
   */
  @Get('model.weights.bin')
  async getBin(@Res() res: Response) {
    return this.predictionService.getModelBin(res);
  }
}
