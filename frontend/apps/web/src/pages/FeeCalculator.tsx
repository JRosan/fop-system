import { useState } from 'react';
import { Calculator } from 'lucide-react';
import type { ApplicationType, FeeCalculationResult } from '@fop/types';

export function FeeCalculator() {
  const [applicationType, setApplicationType] = useState<ApplicationType>('ONE_TIME');
  const [seatCount, setSeatCount] = useState(0);
  const [mtowKg, setMtowKg] = useState(0);
  const [result, setResult] = useState<FeeCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    // Simulate calculation - in production would call API
    await new Promise((resolve) => setTimeout(resolve, 500));

    const baseFee = 150;
    const seatFee = seatCount * 10;
    const weightFee = mtowKg * 0.02;
    const multiplier =
      applicationType === 'BLANKET' ? 2.5 : applicationType === 'EMERGENCY' ? 0.5 : 1;
    const total = (baseFee + seatFee + weightFee) * multiplier;

    setResult({
      baseFee: { amount: baseFee, currency: 'USD' },
      seatFee: { amount: seatFee, currency: 'USD' },
      weightFee: { amount: weightFee, currency: 'USD' },
      multiplier,
      totalFee: { amount: total, currency: 'USD' },
      breakdown: [
        { description: 'Base Fee', amount: { amount: baseFee, currency: 'USD' } },
        { description: `Seat Fee (${seatCount} × $10)`, amount: { amount: seatFee, currency: 'USD' } },
        { description: `Weight Fee (${mtowKg} kg × $0.02)`, amount: { amount: weightFee, currency: 'USD' } },
      ],
    });
    setIsCalculating(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Fee Calculator</h1>
        <p className="text-neutral-500 mt-1">
          Estimate the fees for your FOP application
        </p>
      </div>

      <div className="card p-6 space-y-6">
        {/* Permit Type */}
        <div>
          <label className="label">Permit Type</label>
          <select
            value={applicationType}
            onChange={(e) => setApplicationType(e.target.value as ApplicationType)}
            className="input"
          >
            <option value="ONE_TIME">One-Time Permit (1.0x)</option>
            <option value="BLANKET">Blanket Permit (2.5x)</option>
            <option value="EMERGENCY">Emergency Permit (0.5x)</option>
          </select>
        </div>

        {/* Seat Count */}
        <div>
          <label className="label">Number of Seats</label>
          <input
            type="number"
            min="0"
            value={seatCount}
            onChange={(e) => setSeatCount(parseInt(e.target.value) || 0)}
            className="input"
            placeholder="Enter seat count"
          />
        </div>

        {/* MTOW */}
        <div>
          <label className="label">Maximum Takeoff Weight (kg)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={mtowKg}
            onChange={(e) => setMtowKg(parseFloat(e.target.value) || 0)}
            className="input"
            placeholder="Enter MTOW in kilograms"
          />
        </div>

        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="btn-primary w-full"
        >
          <Calculator className="w-4 h-4 mr-2" />
          {isCalculating ? 'Calculating...' : 'Calculate Fee'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Fee Breakdown
          </h2>
          <div className="space-y-3">
            {result.breakdown.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">{item.description}</span>
                <span className="font-medium">
                  ${item.amount.amount.toFixed(2)}
                </span>
              </div>
            ))}
            {result.multiplier !== 1 && (
              <div className="flex justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">
                  Multiplier ({result.multiplier}x)
                </span>
                <span className="font-medium text-primary-600">
                  Applied
                </span>
              </div>
            )}
            <div className="flex justify-between py-3 text-lg font-semibold">
              <span>Total Fee</span>
              <span className="text-primary-600">
                ${result.totalFee.amount.toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Formula Info */}
      <div className="card p-6 bg-neutral-50">
        <h3 className="font-medium text-neutral-900 mb-2">Fee Formula</h3>
        <p className="text-sm text-neutral-600">
          <code className="bg-neutral-200 px-2 py-1 rounded">
            Total = (Base Fee + Seat Fee + Weight Fee) × Multiplier
          </code>
        </p>
        <ul className="text-sm text-neutral-600 mt-3 space-y-1">
          <li>• Base Fee: $150.00</li>
          <li>• Seat Fee: $10.00 per seat</li>
          <li>• Weight Fee: $0.02 per kg MTOW</li>
        </ul>
      </div>
    </div>
  );
}
