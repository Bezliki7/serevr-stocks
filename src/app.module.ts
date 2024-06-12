import { Module } from '@nestjs/common';

import { PredictionModule } from './prediction/prediction.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [PredictionModule, DatabaseModule.forRoot()],
})
export class AppModule {}
