import { Module } from '@nestjs/common';

import { PredictionService } from './services/prediction/prediction.service';
import { PredictionController } from './controllers/prediction.controller';
import { DatasetService } from './services/dataset/dataset.service';

@Module({
  imports: [],
  controllers: [PredictionController],
  providers: [PredictionService, DatasetService],
})
export class PredictionModule {}
