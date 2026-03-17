'use client';

import React, { useState, useMemo } from 'react';
import {
  DeliveryItem,
  DeliverySchedule,
  DeliveryCategory,
  RequirementStatus,
} from '@/lib/types';

interface DeliverablesTableProps {
  schedule: DeliverySchedule | null;
  onItemUpdate: (itemId: string, completed: boolean) => void;
}

const STATUS_COLORS: Record<RequirementStatus, string> = {
  required: 'bg-[#C0392B]/10 text-[#C0392B]',
  if_available: 'bg-[#B8860B]/10 text-[#B8860B]',
  waived: 'bg-[#F5F0E8] text-[#8C8577]',
  conditional: 'bg-blue-50 text-blue-700',
};

const STATUS_LABELS: Record<RequirementStatus, string> = {
  required: 'Required',
  if_available: 'If Available',
  waived: 'Waived',
  conditional: 'Conditional',
};

const CATEGORY_COLORS: Record<DeliveryCategory, string> = {
  cinema_masters: 'bg-violet-50 text-violet-700',
  video_digital: 'bg-blue-50 text-blue-700',
  audio: 'bg-emerald-50 text-emerald-700',
  trailer: 'bg-amber-50 text-amber-700',
  marketing: 'bg-pink-50 text-pink-700',
  legal: 'bg-red-50 text-red-700',
  music_rights: 'bg-indigo-50 text-indigo-700',
  metadata: 'bg-[#F5F0E8] text-[#8C8577]',
};

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

export default function DeliverablesTable({
  schedule,
  onItemUpdate,
}: DeliverablesTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<DeliveryCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<RequirementStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!schedule) {
    return null;
  }

  const filteredItems = useMemo(() => {
    return schedule.items.filter((item) => {
      const matchesCategory =
        !categoryFilter || item.category === categoryFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.technicalSpecs.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [schedule.items, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="bg-white rounded-xl border border-[#E2DACB] overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-[#E2DACB] space-y-4">
        <div>
          <label className="block text-xs font-medium text-[#8C8577] mb-1.5">
            Search Items
          </label>
          <input
            type="text"
            placeholder="Search by name or specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E2DACB] rounded-lg text-[#1A1714] text-sm placeholder-[#8C8577]/50 focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]/40 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8C8577] mb-1.5">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as DeliveryCategory | '')
              }
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2DACB] rounded-lg text-[#1A1714] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]/40 transition-all"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                <option key={cat} value={cat}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8C8577] mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as RequirementStatus | '')
              }
              className="w-full px-3.5 py-2.5 bg-white border border-[#E2DACB] rounded-lg text-[#1A1714] text-sm focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]/40 transition-all"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F5F0E8]/50 border-b border-[#E2DACB]">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8C8577] uppercase tracking-wider w-12">
                Done
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8C8577] uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8C8577] uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8C8577] uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8C8577] uppercase tracking-wider">
                Technical Specs
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium text-[#8C8577] uppercase tracking-wider w-12">
                QC
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#8C8577]" style={{ fontFamily: 'Georgia, serif' }}>
                  No items match the selected filters
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <React.Fragment key={item.id}>
                  <tr
                    className={`border-b border-[#E2DACB]/60 hover:bg-[#F5F0E8]/30 cursor-pointer transition-colors ${
                      item.completed ? 'bg-[#2D7A4F]/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) =>
                          onItemUpdate(item.id, e.target.checked)
                        }
                        className="w-5 h-5 text-[#2D7A4F] rounded cursor-pointer accent-[#2D7A4F]"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[#1A1714]">
                      {item.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-[10px] font-medium ${
                          CATEGORY_COLORS[item.category]
                        }`}
                      >
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-[10px] font-medium ${
                          STATUS_COLORS[item.status]
                        }`}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#8C8577]" style={{ fontFamily: 'Georgia, serif' }}>
                      {item.technicalSpecs || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.qcRequired ? (
                        <span className="text-[#2D7A4F] text-lg" title="QC Required">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[#E2DACB]">—</span>
                      )}
                    </td>
                  </tr>

                  {expandedId === item.id && (
                    <tr className="bg-[#F5F0E8]/30 border-b border-[#E2DACB]/60">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-[#1A1714] mb-1">
                              Full Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-[#8C8577] uppercase tracking-wide">
                                  Quantity
                                </p>
                                <p className="text-sm font-medium text-[#1A1714]">
                                  {item.quantity}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-[#8C8577] uppercase tracking-wide">
                                  Delivery Method
                                </p>
                                <p className="text-sm font-medium text-[#1A1714]">
                                  {item.deliveryMethod}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-[#8C8577] uppercase tracking-wide">
                                  Technical Specs
                                </p>
                                <p className="text-sm font-medium text-[#1A1714]">
                                  {item.technicalSpecs || 'Not specified'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-[#8C8577] uppercase tracking-wide">
                                  QC Required
                                </p>
                                <p className="text-sm font-medium text-[#1A1714]">
                                  {item.qcRequired ? 'Yes' : 'No'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {item.notes && (
                            <div>
                              <p className="text-xs text-[#8C8577] uppercase tracking-wide mb-1">
                                Notes
                              </p>
                              <p className="text-sm text-[#1A1714] bg-white p-2 rounded-lg border border-[#E2DACB]" style={{ fontFamily: 'Georgia, serif' }}>
                                {item.notes}
                              </p>
                            </div>
                          )}

                          {item.condition && (
                            <div>
                              <p className="text-xs text-[#8C8577] uppercase tracking-wide mb-1">
                                Condition
                              </p>
                              <p className="text-sm text-[#1A1714] bg-white p-2 rounded-lg border border-[#E2DACB]" style={{ fontFamily: 'Georgia, serif' }}>
                                {item.condition}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-[#F5F0E8]/50 border-t border-[#E2DACB] text-sm text-[#8C8577]">
        Showing {filteredItems.length} of {schedule.items.length} items
      </div>
    </div>
  );
}
