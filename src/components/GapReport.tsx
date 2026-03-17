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
  critical: { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-600' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', badge: 'bg-orange-600' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-600' },
  low: { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-600' },
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
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="8"
                  strokeDasharray={`${(report.completionPercentage / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#1B3A5C]">
                    {report.completionPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col justify-center">
            <div className="text-sm text-gray-500 mb-1">Total Gaps</div>
            <div className="text-3xl font-bold text-[#1B3A5C]">
              {report.totalGaps}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-sm text-gray-500 mb-1">Critical</div>
            <div className="text-3xl font-bold text-red-600">
              {report.criticalGaps}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-sm text-gray-500 mb-1">High</div>
            <div className="text-3xl font-bold text-orange-600">
              {report.highGaps}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="text-sm text-gray-500 mb-1">Medium</div>
            <div className="text-3xl font-bold text-yellow-600">
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
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {CATEGORY_LABELS[category as DeliveryCategory]}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {gaps.length} gap{gaps.length !== 1 ? 's' : ''} in this category
              </p>
            </div>

            <div className="divide-y divide-gray-200">
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
                            <h4 className="font-semibold text-gray-900">
                              {gapItem.deliveryItemName}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600">
                            {gap.description}
                          </p>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
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
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                            What is Needed
                          </p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {gap.whatIsNeeded}
                          </p>
                        </div>

                        {gap.whoToContact && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                              Contact
                            </p>
                            <p className="text-sm text-gray-700">
                              {gap.whoToContact}
                            </p>
                          </div>
                        )}

                        {gap.templateMessage && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                              Request Template
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded p-3">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                {gap.templateMessage}
                              </pre>
                            </div>
                            <button
                              onClick={() => {
                                const message = gap.templateMessage || '';
                                copyToClipboard(message, gapItem.deliveryItemId);
                              }}
                              className="mt-3 px-4 py-2 bg-[#1B3A5C] text-white text-sm font-medium rounded hover:bg-[#2E5D8A] transition-colors"
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
            All Requirements Met!
          </h3>
          <p className="text-green-800">
            Your delivery schedule is complete and ready for distribution.
          </p>
        </div>
      )}
    </div>
  );
}
