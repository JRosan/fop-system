import { apiClient } from '../client';
import type { ApplicationType, FeeCalculationResult } from '@fop/types';

export const feesApi = {
  async calculate(
    type: ApplicationType,
    seatCount: number,
    mtowKg: number
  ): Promise<FeeCalculationResult> {
    const { data } = await apiClient.get('/fees/calculate', {
      params: { type, seatCount, mtowKg },
    });
    return data;
  },
};
