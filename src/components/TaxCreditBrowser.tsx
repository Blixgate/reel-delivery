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

  const countries = Array.from(new Set(programs.map((p) => p.country))).sort();

  useEffect(() => {
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

    filtered.sort((a, b) => b.basePercentage - a.basePercentage);
    setFilteredPrograms(filtered);
  }, [programs, countryFilter, minPercentageFilter]);

  const CREDIT_TYPE_COLORS = {
    refundable: 'bg-[#2D7A4F]/10 text-[#2D7A4F]',
    transferable: 'bg-blue-50 text-blue-700',
    non_refundable: 'bg-[#B8860B]/10 text-[#B8860B]',
    rebate: 'bg-violet-50 text-violet-700',
    grant: 'bg-pink-50 text-pink-700',
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-[#E2DACB] p-6">
        <h3 className="font-semibold text-[#1A1714] mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8C8577] mb-1.5">
              Country
            </label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2DACB] rounded-lg text-[#1A1714] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]/40 transition-all"
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
            <label className="block text-xs font-medium text-[#8C8577] mb-1.5">
              Minimum Percentage
            </label>
            <select
              value={minPercentageFilter}
              onChange={(e) => setMinPercentageFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2DACB] rounded-lg text-[#1A1714] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]/40 transition-all"
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
              className="w-full px-4 py-2.5 bg-[#F5F0E8] text-[#1A1714] rounded-lg hover:bg-[#EDE7DB] transition-colors font-medium text-sm border border-[#E2DACB]"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div>
        <p className="text-sm text-[#8C8577] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          Showing {filteredPrograms.length} tax incentive program
          {filteredPrograms.length !== 1 ? 's' : ''}
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#B8860B]/30 border-t-[#B8860B] rounded-full animate-spin" />
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="bg-[#F5F0E8]/50 rounded-xl p-8 text-center border border-[#E2DACB]">
            <p className="text-[#8C8577]" style={{ fontFamily: 'Georgia, serif' }}>
              No programs match your filters. Try adjusting your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-xl border border-[#E2DACB] overflow-hidden hover:shadow-lg hover:shadow-[#1A1714]/[0.04] transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-[#1A1714] text-lg">
                        {program.programName}
                      </h3>
                      <p className="text-sm text-[#8C8577]" style={{ fontFamily: 'Georgia, serif' }}>
                        {program.jurisdiction}
                        {program.region && `, ${program.region}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-[#1A1714]">
                        {program.basePercentage}%
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-[10px] font-semibold mt-1 ${
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
                      <div className="bg-[#F5F0E8]/50 p-2 rounded-lg">
                        <p className="text-xs text-[#8C8577] uppercase tracking-wide">
                          Min Spend
                        </p>
                        <p className="text-sm font-medium text-[#1A1714]">
                          ${(program.minimumSpend / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    )}
                    {program.capPerProject && (
                      <div className="bg-[#F5F0E8]/50 p-2 rounded-lg">
                        <p className="text-xs text-[#8C8577] uppercase tracking-wide">
                          Project Cap
                        </p>
                        <p className="text-sm font-medium text-[#1A1714]">
                          ${(program.capPerProject / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bonuses */}
                  {program.bonusPercentages && program.bonusPercentages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-[#8C8577] font-semibold mb-2">
                        Available Bonuses:
                      </p>
                      <ul className="text-xs text-[#8C8577] space-y-1">
                        {program.bonusPercentages.map((bonus, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#2D7A4F] font-bold">+{bonus.additionalPercentage}%</span>
                            <span style={{ fontFamily: 'Georgia, serif' }}>{bonus.description}</span>
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
                    className="w-full text-left text-sm font-medium text-[#B8860B] hover:text-[#9A7209] transition-colors flex items-center justify-between"
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
                  <div className="border-t border-[#E2DACB] bg-[#F5F0E8]/30 p-6 space-y-4">
                    <div>
                      <p className="text-xs text-[#8C8577] uppercase tracking-wide font-semibold mb-2">
                        Qualifying Expenses
                      </p>
                      <ul className="text-sm text-[#1A1714] space-y-1 list-disc list-inside" style={{ fontFamily: 'Georgia, serif' }}>
                        {program.qualifyingExpenses.slice(0, 4).map((expense, idx) => (
                          <li key={idx}>{expense}</li>
                        ))}
                        {program.qualifyingExpenses.length > 4 && (
                          <li className="text-[#8C8577]">
                            and {program.qualifyingExpenses.length - 4} more...
                          </li>
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs text-[#8C8577] uppercase tracking-wide font-semibold mb-2">
                        Timeline
                      </p>
                      <p className="text-sm text-[#1A1714]" style={{ fontFamily: 'Georgia, serif' }}>{program.typicalTimeline}</p>
                    </div>

                    <div>
                      <p className="text-xs text-[#8C8577] uppercase tracking-wide font-semibold mb-2">
                        Residency Requirements
                      </p>
                      <p className="text-sm text-[#1A1714]" style={{ fontFamily: 'Georgia, serif' }}>
                        {program.residencyRequirements}
                      </p>
                    </div>

                    {program.websiteUrl && (
                      <a
                        href={program.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-[#1A1714] text-[#FDFBF7] text-xs font-medium rounded-lg hover:bg-[#2A2720] transition-colors"
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
