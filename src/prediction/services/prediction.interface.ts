import { Prediction as BasePrediction } from '@prisma/client';

export type Prediction = {
  name: string;
  isMoreRisk: boolean;
  periodType: 'short' | 'mid' | 'long';
  dateOfCreation: Date;
  startDate: Date;
  endDate: Date;
  predictions: Omit<BasePrediction, 'id' | 'portfolioId'>[];
};
