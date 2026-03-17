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
  required: 'bg-red-100 text-red-800',
  if_available: 'bg-yellow-100 text-yellow-800',
  waived: 'bg-gray-100 text-gray-800',
  conditional: 'bg-blue-100 text-blue-800',
};

const STATUS_LABELS: Record<RequirementStatus, string> = {
  required: 'Required',
  if_available: 'If Available',
  waived: 'Waived',
  conditional: 'Conditional',
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Items
          </label>
          <input
            type="text"
            placeholder="Search by name or specs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5D8A]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as DeliveryCategory | '')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5D8A]"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as RequirementStatus | '')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5D8A]"
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
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-12">
                Done
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Item Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Category
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Technical Specs
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-12">
                QC
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No items match the selected filters
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <React.Fragment key={item.id}>
                  <tr
                    className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                      item.completed ? 'bg-green-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(e) =>
                          onItemUpdate(item.id, e.target.checked)
                        }
                        className="w-5 h-5 text-[#10B981] rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          CATEGORY_COLORS[item.category]
                        }`}
                      >
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          STATUS_COLORS[item.status]
                        }`}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.technicalSpecs || '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {item.qcRequired ? (
                        <span className="text-lg" title="QC Required">
                          ✓
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>

                  {expandedId === item.id && (
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              Full Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  Quantity
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.quantity}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  Delivery Method
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.deliveryMethod}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  Technical Specs
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.technicalSpecs || 'Not specified'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">
                                  QC Required
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.qcRequired ? 'Yes' : 'No'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {item.notes && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                Notes
                              </p>
                              <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
                                {item.notes}
                              </p>
                            </div>
                          )}

                          {item.condition && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                Condition
                              </p>
                              <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200">
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
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        Showing {filteredItems.length} of {schedule.items.length} items
      </div>
    </div>
  );
}
