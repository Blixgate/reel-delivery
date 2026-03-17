'use client';

import React, { useState, useEffect } from 'react';
import { TaxIncentiveProgram } from '@/lib/types';

interface TaxCreditBrowserProps {
  isLoading?: boolean;
}

export default function TaxCreditBrowser({ isLoading: initialLoading = false }: TaxCreditBrowserProps) {
  const [programs, setPrograms] = useState<TaxIncentiveProgram[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<TaxIncentiveProgram[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [minPercentageFilter, setMinPercentageFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Get unique countries
  const countries = Array.from(new Set(programs.map((p) => p.country))).sort();

  useEffect(() => {
    // Fetch tax incentive programs
    const fetchPrograms = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (countryFilter) params.append('country', countryFilter);
        if (minPercentageFilter) params.append('minPercentage', minPercentageFilter);

        const response = await fetch(`/api/tax-incentives?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch tax incentives');

        const data: TaxIncentiveProgram[] = await response.json();
        setPrograms(data);
      } catch (error) {
        console.error('Error fetching tax incentives:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, [countryFilter, minPercentageFilter]);

  useEffect(() => {
    let filtered = programs;

    if (countryFilter) {
      filtered = filtered.filter((p) => p.country === countryFilter);
    }

    if (minPercentageFilter) {
      const minPercent = parseFloat(minPercentageFilter);
      filtered = filtered.filter((p) => p.basePercentage >= minPercent);
    }

    // Sort by percentage descending
    filtered.sort((a, b) => b.basePercentage - a.basePercentage);
    setFilteredPrograms(filtered);
  }, [programs, countryFilter, minPercentageFilter]);

  const CREDIT_TYPE_COLORS = {
    refundable: 'bg-green-100 text-green-800',
    transferable: 'bg-blue-100 text-blue-800',
    non_refundable: 'bg-orange-100 text-orange-800',
    rebate: 'bg-purple-100 text-purple-800',
    grant: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5D8A]"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Percentage
            </label>
            <select
              value={minPercentageFilter}
              onChange={(e) => setMinPercentageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5D8A]"
            >
              <option value="">Any percentage</option>
              <option value="15">15% or higher</option>
              <option value="20">20% or higher</option>
              <option value="25">25% or higher</option>
              <option value="30">30% or higher</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setCountryFilter('');
                setMinPercentageFilter('');
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredPrograms.length} tax incentive program
          {filteredPrograms.length !== 1 ? 's' : ''}
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <svg
                className="w-8 h-8 text-[#1B3A5C]"
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
            </div>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
            <p className="text-gray-500">
              No programs match your filters. Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {program.programName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {program.jurisdiction}
                        {program.region && `, ${program.region}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-[#1B3A5C]">
                        {program.basePercentage}%
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                          CREDIT_TYPE_COLORS[program.creditType]
                        }`}
                      >
                        {program.creditType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {program.minimumSpend && (
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Min Spend
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          ${(program.minimumSpend / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    )}
                    {program.capPerProject && (
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Project Cap
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          ${(program.capPerProject / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bonuses */}
                  {program.bonusPercentages && program.bonusPercentages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 font-semibold mb-2">
                        Available Bonuses:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {program.bonusPercentages.map((bonus, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">+{bonus.additionalPercentage}%</span>
                            <span>{bonus.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Expand Button */}
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === program.id ? null : program.id)
                    }
                    className="w-full text-left text-sm font-medium text-[#1B3A5C] hover:text-[#2E5D8A] transition-colors flex items-center justify-between"
                  >
                    <span>
                      {expandedId === program.id ? 'Hide' : 'Show'} Details
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedId === program.id ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedId === program.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                        Qualifying Expenses
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                        {program.qualifyingExpenses.slice(0, 4).map((expense, idx) => (
                          <li key={idx}>{expense}</li>
                        ))}
                        {program.qualifyingExpenses.length > 4 && (
                          <li className="text-gray-500">
                            and {program.qualifyingExpenses.length - 4} more...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                        Timeline
                      </p>
                      <p className="text-sm text-gray-700">{program.typicalTimeline}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                        Residency Requirements
                      </p>
                      <p className="text-sm text-gray-700">
                        {program.residencyRequirements}
                      </p>
                    </div>

                    {program.websiteUrl && (
                      <a
                        href={program.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-3 py-1 bg-[#1B3A5C] text-white text-xs font-medium rounded hover:bg-[#2E5D8A] transition-colors"
                      >
                        Visit Official Site
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
