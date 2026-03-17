'use client';

import React from 'react';
import { DeliverySchedule, DeliveryCategory } from '@/lib/types';

interface StatsBarProps {
  schedule: DeliverySchedule | null;
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

const CATEGORY_COLORS: Record<DeliveryCategory, string> = {
  cinema_masters: 'bg-purple-100 text-purple-800',
  video_digital: 'bg-blue-100 text-blue-800',
  audio: 'bg-green-100 text-green-800',
  trailer: 'bg-yellow-100 text-yellow-800',
  marketing: 'bg-pink-100 text-pink-800',
  legal: 'bg-red-100 text-red-800',
  music_rights: 'bg-indigo-100 text-indigo-800',
  metadata: 'bg-gray-100 text-gray-800',
};

export default function StatsBar({ schedule }: StatsBarProps) {
  if (!schedule) {
    return null;
  }

  const progressPercentage = Math.round(
    (schedule.completedItems / schedule.totalItems) * 100
  );

  // Category breakdown
  const categoryCount: Record<DeliveryCategory, number> = {
    cinema_masters: 0,
    video_digital: 0,
    audio: 0,
    trailer: 0,
    marketing: 0,
    legal: 0,
    music_rights: 0,
    metadata: 0,
  };

  schedule.items.forEach((item) => {
    categoryCount[item.category]++;
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-[#1B3A5C]">
            {schedule.totalItems}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Items</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-[#1B3A5C]">
            {schedule.requiredItems}
          </div>
          <div className="text-sm text-gray-600 mt-1">Required</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-[#10B981]">
            {schedule.completedItems}
          </div>
          <div className="text-sm text-gray-600 mt-1">Completed</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-3xl font-bold text-[#2E5D8A]">
            {progressPercentage}%
          </div>
          <div className="text-sm text-gray-600 mt-1">Progress</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">
            {schedule.filmTitle}
          </div>
          <div className="text-xs text-gray-500">{schedule.distributor}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-semibold text-[#1B3A5C]">
            {schedule.completedItems} of {schedule.totalItems}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#10B981] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-[#1B3A5C] mb-4">
          Category Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(categoryCount).map(([category, count]) => (
            count > 0 && (
              <div
                key={category}
                className={`p-3 rounded-lg ${CATEGORY_COLORS[category as DeliveryCategory]}`}
              >
                <div className="text-2xl font-bold">
                  {count}
                </div>
                <div className="text-xs font-medium mt-1">
                  {CATEGORY_LABELS[category as DeliveryCategory]}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
