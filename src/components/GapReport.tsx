'use client';

import React, { useState } from 'react';
import { GapReport as GapReportType, DeliveryCategory } from '@/lib/types';

interface GapReportProps {
  report: GapReportType | null;
  filmTitle: string;
  distributor: string;
}

const CATEGORY_LABELS: Record<DeliveryCategory, string> = {
  cinema_masters: 'Cinema Masters',
  video_digital: 'Video/Digital',
  audio: 'Audio',
  trailer: 'Trailer',
  marketing: 'Marketing',
  legal: 'Legal',
  music_rights: 'Music Rights',
  metadata: 'Metadata',
};

const SEVERITY_COLORS = {
  critical: { bg: 'bg-[#C0392B]/5', text: 'text-[#C0392B]', badge: 'bg-[#C0392B]' },
  high: { bg: 'bg-[#B8860B]/5', text: 'text-[#B8860B]', badge: 'bg-[#B8860B]' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-500' },
  low: { bg: 'bg-[#F5F0E8]', text: 'text-[#8C8577]', badge: 'bg-[#8C8577]' },
};

export default function GapReport({
  report,
  filmTitle,
  distributor,
}: GapReportProps) {
  const [expandedGapId, setExpandedGapId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  if (!report) {
    return (
      <div className="bg-white rounded-xl border border-[#E2DACB] p-8 text-center">
        <p className="text-[#8C8577]" style={{ fontFamily: 'Georgia, serif' }}>
          Upload a delivery schedule and documents to analyze gaps
        </p>
      </div>
    );
  }

  const copyToClipboard = (text: string, gapId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(gapId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Completion Summary */}
      <div className="bg-white rounded-xl border border-[#E2DACB] p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Circular Progress */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#E2DACB"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#2D7A4F"
                  strokeWidth="8"
                  strokeDasharray={`${(report.completionPercentage / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#1A1714]">
                    {report.completionPercentage}%
                  </div>
                  <div className="text-xs text-[#8C8577]">Complete</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col justify-center">
            <div className="text-sm text-[#8C8577] mb-1">Total Gaps</div>
            <div className="text-3xl font-bold text-[#1A1714]">
              {report.totalGaps}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-sm text-[#8C8577] mb-1">Critical</div>
            <div className="text-3xl font-bold text-[#C0392B]">
              {report.criticalGaps}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-sm text-[#8C8577] mb-1">High</div>
            <div className="text-3xl font-bold text-[#B8860B]">
              {report.highGaps}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-sm text-[#8C8577] mb-1">Medium</div>
            <div className="text-3xl font-bold text-amber-600">
              {report.mediumGaps}
            </div>
          </div>
        </div>
      </div>

      {/* Gaps by Category */}
      {Object.entries(report.gapsByCategory)
        .filter(([_, gaps]) => gaps.length > 0)
        .map(([category, gaps]) => (
          <div
            key={category}
            className="bg-white rounded-xl border border-[#E2DACB] overflow-hidden"
          >
            <div className="bg-[#F5F0E8]/50 px-6 py-4 border-b border-[#E2DACB]">
              <h3 className="font-semibold text-[#1A1714]">
                {CATEGORY_LABELS[category as DeliveryCategory]}
              </h3>
              <p className="text-sm text-[#8C8577] mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                {gaps.length} gap{gaps.length !== 1 ? 's' : ''} in this category
              </p>
            </div>

            <div className="divide-y divide-[#E2DACB]/60">
              {gaps.map((gapItem) => {
                const isExpanded = expandedGapId === gapItem.deliveryItemId;
                const gap = gapItem.gap;
                const colors = SEVERITY_COLORS[gap.severity];

                return (
                  <div key={gapItem.deliveryItemId} className="p-6">
                    <button
                      onClick={() =>
                        setExpandedGapId(
                          isExpanded ? null : gapItem.deliveryItemId
                        )
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`${colors.badge} text-white px-3 py-1 rounded-full text-xs font-semibold uppercase`}
                            >
                              {gap.severity}
                            </span>
                            <h4 className="font-semibold text-[#1A1714]">
                              {gapItem.deliveryItemName}
                            </h4>
                          </div>
                          <p className="text-sm text-[#8C8577]" style={{ fontFamily: 'Georgia, serif' }}>
                            {gap.description}
                          </p>
                        </div>
                        <svg
                          className={`w-5 h-5 text-[#8C8577] flex-shrink-0 transition-transform ${
                            isExpanded ? 'transform rotate-180' : ''
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
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#E2DACB] space-y-4">
                        <div>
                          <p className="text-xs text-[#8C8577] uppercase tracking-wide font-semibold mb-2">
                            What is Needed
                          </p>
                          <p className="text-sm text-[#1A1714] bg-[#F5F0E8]/50 p-3 rounded-lg" style={{ fontFamily: 'Georgia, serif' }}>
                            {gap.whatIsNeeded}
                          </p>
                        </div>

                        {gap.whoToContact && (
                          <div>
                            <p className="text-xs text-[#8C8577] uppercase tracking-wide font-semibold mb-2">
                              Contact
                            </p>
                            <p className="text-sm text-[#1A1714]">
                              {gap.whoToContact}
                            </p>
                          </div>
                        )}

                        {gap.templateMessage && (
                          <div>
                            <p className="text-xs text-[#8C8577] uppercase tracking-wide font-semibold mb-2">
                              Request Template
                            </p>
                            <div className="bg-[#F5F0E8]/50 border border-[#E2DACB] rounded-lg p-3">
                              <pre className="text-xs text-[#1A1714] whitespace-pre-wrap font-mono">
                                {gap.templateMessage}
                              </pre>
                            </div>
                            <button
                              onClick={() => {
                                const message = gap.templateMessage || '';
                                copyToClipboard(message, gapItem.deliveryItemId);
                              }}
                              className="mt-3 px-4 py-2 bg-[#1A1714] text-[#FDFBF7] text-sm font-medium rounded-lg hover:bg-[#2A2720] transition-colors"
                            >
                              {copiedMessageId === gapItem.deliveryItemId
                                ? 'Copied!'
                                : 'Copy Request'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      {report.totalGaps === 0 && (
        <div className="bg-[#2D7A4F]/5 border border-[#2D7A4F]/15 rounded-xl p-8 text-center">
          <svg
            className="w-12 h-12 text-[#2D7A4F] mx-auto mb-4"
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
          <h3 className="text-lg font-semibold text-[#2D7A4F] mb-2">
            All Requirements Met!
          </h3>
          <p className="text-[#2D7A4F]/80" style={{ fontFamily: 'Georgia, serif' }}>
            Your delivery schedule is complete and ready for distribution.
          </p>
        </div>
      )}
    </div>
  );
}
