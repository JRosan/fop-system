import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calculator, Info } from 'lucide-react';
import { feesApi } from '@fop/api';
import type { ApplicationType } from '@fop/types';
import { formatMoney } from '../utils/date';

const typeOptions: { value: ApplicationType; label: string; description: string }[] = [
  {
    value: 'ONE_TIME',
    label: 'One-Time Permit',
    description: 'Single flight operation (1.0x multiplier)',
  },
  {
    value: 'BLANKET',
    label: 'Blanket Permit',
    description: 'Multiple flights over a period (2.5x multiplier)',
  },
  {
    value: 'EMERGENCY',
    label: 'Emergency Permit',
    description: 'Urgent humanitarian operations (0.5x multiplier)',
  },
];

export function FeeCalculator() {
  const [applicationType, setApplicationType] = useState<ApplicationType>('ONE_TIME');
  const [seatCount, setSeatCount] = useState<number>(50);
  const [mtowKg, setMtowKg] = useState<number>(25000);

  const { data: feeResult, isLoading, error, refetch } = useQuery({
    queryKey: ['feeCalculation', applicationType, seatCount, mtowKg],
    queryFn: () => feesApi.calculate(applicationType, seatCount, mtowKg),
    enabled: seatCount > 0 && mtowKg > 0,
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Fee Calculator</h1>
        <p className="text-neutral-500 mt-1">
          Estimate the fees for your Foreign Operator Permit application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator Form */}
        <div className="card p-6">
          <form onSubmit={handleCalculate} className="space-y-6">
            {/* Permit Type */}
            <div>
              <label className="label">Permit Type</label>
              <div className="space-y-3">
                {typeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      applicationType === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="applicationType"
                      value={option.value}
                      checked={applicationType === option.value}
                      onChange={() => setApplicationType(option.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-neutral-900">{option.label}</p>
                      <p className="text-sm text-neutral-500">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Aircraft Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="seatCount" className="label">
                  Seat Capacity
                </label>
                <input
                  id="seatCount"
                  type="number"
                  min="1"
                  max="1000"
                  value={seatCount}
                  onChange={(e) => setSeatCount(parseInt(e.target.value) || 0)}
                  className="input"
                />
                <p className="text-xs text-neutral-500 mt-1">Number of passenger seats</p>
              </div>
              <div>
                <label htmlFor="mtowKg" className="label">
                  MTOW (kg)
                </label>
                <input
                  id="mtowKg"
                  type="number"
                  min="1"
                  max="1000000"
                  value={mtowKg}
                  onChange={(e) => setMtowKg(parseInt(e.target.value) || 0)}
                  className="input"
                />
                <p className="text-xs text-neutral-500 mt-1">Maximum takeoff weight</p>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              <Calculator className="w-4 h-4 mr-2" />
              {isLoading ? 'Calculating...' : 'Calculate Fee'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Fee Breakdown</h2>

          {error && (
            <div className="p-4 bg-error-50 border border-error-200 rounded-lg mb-4">
              <p className="text-error-700">Failed to calculate fee. Please try again.</p>
            </div>
          )}

          {feeResult ? (
            <>
              {/* Total */}
              <div className="text-center p-6 bg-primary-50 rounded-lg mb-6">
                <p className="text-sm text-primary-600 mb-1">Estimated Total Fee</p>
                <p className="text-4xl font-bold text-primary-700">
                  {formatMoney(feeResult.totalFee.amount, feeResult.totalFee.currency)}
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3">
                {feeResult.breakdown.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0"
                  >
                    <span className="text-neutral-600">{item.description}</span>
                    <span className="font-medium text-neutral-900">
                      {formatMoney(item.amount.amount, item.amount.currency)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-neutral-200">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Base Fee</dt>
                    <dd className="font-medium">
                      {formatMoney(feeResult.baseFee.amount, feeResult.baseFee.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Seat Fee ({seatCount} seats)</dt>
                    <dd className="font-medium">
                      {formatMoney(feeResult.seatFee.amount, feeResult.seatFee.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Weight Fee ({mtowKg.toLocaleString()} kg)</dt>
                    <dd className="font-medium">
                      {formatMoney(feeResult.weightFee.amount, feeResult.weightFee.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Permit Multiplier</dt>
                    <dd className="font-medium">{feeResult.multiplier}x</dd>
                  </div>
                </dl>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-neutral-500">
              <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Enter your aircraft details to calculate the permit fee</p>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-neutral-600">
                <p className="font-medium mb-1">Fee Calculation Formula</p>
                <p>(Base + Seats x Per-Seat Rate + Weight x Per-Kg Rate) x Multiplier</p>
                <p className="mt-2">
                  Final fees may vary based on additional services or document requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
