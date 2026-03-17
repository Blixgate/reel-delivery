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
  cinema_masters: 'bg-violet-50 text-violet-700 border border-violet-100',
  video_digital: 'bg-blue-50 text-blue-700 border border-blue-100',
  audio: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  trailer: 'bg-amber-50 text-amber-700 border border-amber-100',
  marketing: 'bg-pink-50 text-pink-700 border border-pink-100',
  legal: 'bg-red-50 text-red-700 border border-red-100',
  music_rights: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  metadata: 'bg-[#F5F0E8] text-[#8C8577] border border-[#E2DACB]',
};

export default function StatsBar({ schedule }: StatsBarProps) {
  if (!schedule) {
    return null;
  }

  const progressPercentage = Math.round(
    (schedule.completedItems / schedule.totalItems) * 100
  );

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
        <div className="bg-white p-4 rounded-xl border border-[#E2DACB]">
          <div className="text-3xl font-bold text-[#1A1714]">
            {schedule.totalItems}
          </div>
          <div className="text-sm text-[#8C8577] mt-1">Total Items</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2DACB]">
          <div className="text-3xl font-bold text-[#1A1714]">
            {schedule.requiredItems}
          </div>
          <div className="text-sm text-[#8C8577] mt-1">Required</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2DACB]">
          <div className="text-3xl font-bold text-[#2D7A4F]">
            {schedule.completedItems}
          </div>
          <div className="text-sm text-[#8C8577] mt-1">Completed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2DACB]">
          <div className="text-3xl font-bold text-[#B8860B]">
            {progressPercentage}%
          </div>
          <div className="text-sm text-[#8C8577] mt-1">Progress</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#E2DACB]">
          <div className="text-sm font-medium text-[#1A1714] mb-2">
            {schedule.filmTitle}
          </div>
          <div className="text-xs text-[#8C8577]" style={{ fontFamily: 'Georgia, serif' }}>{schedule.distributor}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2DACB]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#1A1714]">Overall Progress</span>
          <span className="text-sm font-semibold text-[#1A1714]">
            {schedule.completedItems} of {schedule.totalItems}
          </span>
        </div>
        <div className="w-full bg-[#F5F0E8] rounded-full h-2">
          <div
            className="bg-[#2D7A4F] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-[#E2DACB]">
        <h3 className="text-lg font-semibold text-[#1A1714] mb-4">
          Category Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(categoryCount).map(([category, count]) => (
            count > 0 && (
              <div
                key={category}
                className={`p-3 rounded-xl ${CATEGORY_COLORS[category as DeliveryCategory]}`}
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
