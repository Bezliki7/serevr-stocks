import { PeriodTypeEnum } from '@prisma/client';

export const PERIOD_TYPE = {
  SHORT: 'short',
  MID: 'mid',
  LONG: 'long',
} as const;

export const CONVERT_PERIOD_TYPE = {
  FROM_BD: {
    [PeriodTypeEnum.LONG]: PERIOD_TYPE.LONG,
    [PeriodTypeEnum.MID]: PERIOD_TYPE.MID,
    [PeriodTypeEnum.SHORT]: PERIOD_TYPE.SHORT,
  },
  TO_BD: {
    [PERIOD_TYPE.LONG]: PeriodTypeEnum.LONG,
    [PERIOD_TYPE.MID]: PeriodTypeEnum.MID,
    [PERIOD_TYPE.SHORT]: PeriodTypeEnum.SHORT,
  },
} as const;
