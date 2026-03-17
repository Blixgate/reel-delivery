'use client';

import React from 'react';
import { FinancePlan, CapitalStackItem, TerritoryEstimate, TaxIncentive } from '@/lib/types';

interface FinancePlanViewProps {
  plan: FinancePlan | null;
}

const FINANCING_COLORS: Record<string, string> = {
  presales: 'bg-green-500',
  gap_financing: 'bg-blue-500',
  tax_credit: 'bg-purple-500',
  equity: 'bg-pink-500',
  deferral: 'bg-yellow-500',
  mezzanine: 'bg-indigo-500',
  soft_money: 'bg-orange-500',
  in_kind: 'bg-teal-500',
  bank_loan: 'bg-cyan-500',
  other: 'bg-gray-500',
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function FinancePlanView({ plan }: FinancePlanViewProps) {
  if (!plan) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">
          Upload sales estimates to generate a finance plan
        </p>
      </div>
    );
  }

  const capitalStackTotal = plan.capitalStack.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-br from-[#1B3A5C] to-[#2E5D8A] text-white rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(plan.totalBudget)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Total Secured/Projected</p>
            <p className="text-2xl font-bold">{formatCurrency(capitalStackTotal)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Remaining Gap</p>
            <p className={`text-2xl font-bold ${
              plan.gapAnalysis.gap <= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              {formatCurrency(Math.max(0, plan.gapAnalysis.gap))}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Funding Level</p>
            <p className="text-2xl font-bold">
              {Math.round((capitalStackTotal / plan.totalBudget) * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Capital Stack Visualization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Capital Stack</h3>

        <div className="mb-6">
          <div className="flex h-12 rounded-lg overflow-hidden border border-gray-300">
            {plan.capitalStack.map((item, index) => {
              const percentage = (item.amount / plan.totalBudget) * 100;
              return (
                <div
                  key={index}
                  className={`${FINANCING_COLORS[item.source]} transition-all`}
                  style={{ width: `${percentage}%` }}
                  title={`${item.label}: ${formatCurrency(item.amount)}`}
                />
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {plan.capitalStack.map((item, index) => {
            const percentage = (item.amount / plan.totalBudget) * 100;
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded ${FINANCING_COLORS[item.source]}`}
                ></div>
                <div>
                  <p className="text-xs font-medium text-gray-900">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(item.amount)} ({percentage.toFixed(0)}%)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales Estimates Table */}
      {plan.salesEstimates.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Territory Sales Estimates
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Territory
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Group
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">
                    MG Value
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-700">
                    Net to Producer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {plan.salesEstimates.map((est, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900 font-medium">
                      {est.territory}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {est.territoryGroup || '—'}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900 font-medium">
                      {formatCurrency(est.mgValue)}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600">
                      {est.commissionRate}%
                    </td>
                    <td className="px-6 py-3 text-right text-gray-900 font-medium">
                      {formatCurrency(est.netToProducer)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr className="font-semibold">
                  <td colSpan={2} className="px-6 py-3 text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-3 text-right text-gray-900">
                    {formatCurrency(
                      plan.salesEstimates.reduce((sum, est) => sum + est.mgValue, 0)
                    )}
                  </td>
                  <td className="px-6 py-3"></td>
                  <td className="px-6 py-3 text-right text-gray-900">
                    {formatCurrency(
                      plan.salesEstimates.reduce(
                        (sum, est) => sum + est.netToProducer,
                        0
                      )
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tax Incentives Applied */}
      {plan.taxIncentives.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Tax Incentives Applied
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {plan.taxIncentives.map((incentive) => (
              <div key={incentive.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {incentive.programName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {incentive.jurisdiction}, {incentive.country}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#1B3A5C]">
                      {incentive.percentage}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {incentive.creditType === 'refundable'
                        ? 'Refundable'
                        : 'Non-refundable'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Qualifying Spend
                    </p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(incentive.qualifyingSpend)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Estimated Credit
                    </p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(incentive.estimatedCredit)}
                    </p>
                  </div>
                </div>

                {incentive.notes && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {incentive.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gap Analysis & Suggested Sources */}
      {plan.gapAnalysis.gap > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="font-semibold text-amber-900 mb-4">
            Financing Gap Analysis
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-amber-700 uppercase tracking-wide mb-1">
                Gap Amount
              </p>
              <p className="text-xl font-bold text-amber-900">
                {formatCurrency(plan.gapAnalysis.gap)}
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-700 uppercase tracking-wide mb-1">
                Gap Percentage
              </p>
              <p className="text-xl font-bold text-amber-900">
                {plan.gapAnalysis.gapPercentage.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-700 uppercase tracking-wide mb-1">
                Funding Rate
              </p>
              <p className="text-xl font-bold text-amber-900">
                {(100 - plan.gapAnalysis.gapPercentage).toFixed(1)}%
              </p>
            </div>
          </div>

          {plan.gapAnalysis.suggestedSources.length > 0 && (
            <div>
              <p className="font-semibold text-amber-900 mb-3">
                Suggested Financing Sources
              </p>
              <div className="space-y-2">
                {plan.gapAnalysis.suggestedSources.map((source, idx) => (
                  <div key={idx} className="bg-white p-3 rounded border border-amber-100">
                    <p className="font-medium text-gray-900">
                      {source.source.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {source.rationale}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        Est. {source.timeToSecure}
                      </p>
                      <p className="font-semibold text-[#1B3A5C]">
                        {formatCurrency(source.estimatedAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {plan.gapAnalysis.gap <= 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <svg
            className="w-12 h-12 text-green-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Budget Fully Funded
          </h3>
          <p className="text-green-800">
            Your film is fully financed with no remaining gap.
          </p>
        </div>
      )}
    </div>
  );
}
