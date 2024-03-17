import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { stocks } from '@prisma/client';

import { AppService } from './app.service';
import { isDate } from 'util/types';

class getMoexIndexesDto {
  startDate: string;
  endDate: string;
}

@Controller({ path: 'main' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Put()
  async getMoexIndexesByPeriod(@Body() getMoexIndexesDto: getMoexIndexesDto) {
    const parsedStartDate = new Date(getMoexIndexesDto.startDate);
    const parsedEndDate = new Date(getMoexIndexesDto.endDate);

    const res = await this.appService.getMoexIndexesByPeriod(
      parsedStartDate,
      parsedEndDate,
    );

    return res;
  }
}
