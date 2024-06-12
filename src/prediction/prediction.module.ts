import { Module } from '@nestjs/common';

import { PredictionService } from './services/prediction.service';
import { PredictionController } from './controllers/prediction.controller';

@Module({
  imports: [],
  controllers: [PredictionController],
  providers: [PredictionService],
})
export class PredictionModule {}
