'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FileUpload from '@/components/FileUpload';
import StatsBar from '@/components/StatsBar';
import DeliverablesTable from '@/components/DeliverablesTable';
import GapReport from '@/components/GapReport';
import DocumentsList from '@/components/DocumentsList';
import FinancePlanView from '@/components/FinancePlanView';
import TaxCreditBrowser from '@/components/TaxCreditBrowser';
import { DeliverySchedule, UploadedDocument, GapReport as GapReportType, FinancePlan } from '@/lib/types';

type TabType = 'delivery' | 'documents' | 'finance' | 'tax-credits';

export default function Dashboard() {
  const [currentTab, setCurrentTab] = useState<TabType>('delivery');
  const [schedule, setSchedule] = useState<DeliverySchedule | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [gapReport, setGapReport] = useState<GapReportType | null>(null);
  const [financePlan, setFinancePlan] = useState<FinancePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse file');
      }

      const parsedSchedule: DeliverySchedule = await response.json();
      setSchedule(parsedSchedule);
      setDocuments([]);
      setGapReport(null);
      setFinancePlan(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemUpdate = (itemId: string, completed: boolean) => {
    if (!schedule) return;

    setSchedule({
      ...schedule,
      items: schedule.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              completed,
              completedDate: completed ? new Date().toISOString() : undefined,
            }
          : item
      ),
      completedItems: schedule.items.filter(
        (item) =>
          (item.id === itemId ? completed : item.completed)
      ).length,
    });
  };

  const handleAnalyzeGaps = async () => {
    if (!schedule) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule, documents }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze gaps');
      }

      const report: GapReportType = await response.json();
      setGapReport(report);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to analyze gaps'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFinancePlan = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-finance-plan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate finance plan');
      }

      const plan: FinancePlan = await response.json();
      setFinancePlan(plan);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate finance plan'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Dashboard Header */}
      <header className="border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2m0 2a2 2 0 00-2 2v1a2 2 0 002 2h0a2 2 0 002-2V6a2 2 0 00-2-2zm0 0V2m10 2V2m0 2a2 2 0 00-2 2v1a2 2 0 002 2h0a2 2 0 002-2V6a2 2 0 00-2-2zm0 0V2" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight group-hover:text-white/80 transition-colors">Reel Delivery</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/30 font-mono">v2.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!schedule ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 mb-6 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-2">
                Upload Your Delivery Schedule
              </h2>
              <p className="text-white/40 text-sm mb-6">Drop your delivery schedule to get started. We support .docx, .pdf, and .txt files.</p>
              <FileUpload
                onFileUpload={handleFileUpload}
                isLoading={isLoading}
                error={error}
              />
            </div>

            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              <h3 className="font-semibold text-white/60 mb-4 text-sm uppercase tracking-wider">Workflow</h3>
              <div className="space-y-3">
                {[
                  'Upload your delivery schedule document',
                  'Upload contracts and agreements to track fulfillment',
                  'Analyze gaps to identify missing deliverables',
                  'Generate a finance plan with tax incentives',
                  'Browse and compare tax credit programs',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/40">
                    <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-xs text-white/30 font-mono">{i + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] sticky top-[73px] z-40 backdrop-blur-xl">
              <div className="flex border-b border-white/[0.06] overflow-x-auto">
                {([
                  { id: 'delivery' as TabType, label: 'Delivery', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                  { id: 'documents' as TabType, label: 'Documents', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
                  { id: 'finance' as TabType, label: 'Finance', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { id: 'tax-credits' as TabType, label: 'Tax Credits', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                ] as const).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap text-sm ${
                      currentTab === tab.id
                        ? 'text-white border-blue-500'
                        : 'text-white/40 border-transparent hover:text-white/60'
                    }`}
                  >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {currentTab === 'delivery' && (
                <div className="space-y-6">
                  <StatsBar schedule={schedule} />

                  <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Deliverables</h2>
                    <DeliverablesTable schedule={schedule} onItemUpdate={handleItemUpdate} />
                  </div>

                  {gapReport && (
                    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
                      <h2 className="text-xl font-bold text-white mb-4">Gap Analysis Report</h2>
                      <GapReport report={gapReport} filmTitle={schedule.filmTitle} distributor={schedule.distributor} />
                    </div>
                  )}

                  <button
                    onClick={handleAnalyzeGaps}
                    disabled={isLoading || documents.length === 0}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:from-blue-500 hover:to-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Gaps'}
                  </button>

                  <button
                    onClick={() => {
                      setSchedule(null);
                      setDocuments([]);
                      setGapReport(null);
                      setFinancePlan(null);
                      setError(null);
                    }}
                    className="w-full px-6 py-2 bg-white/[0.04] text-white/50 font-medium rounded-xl hover:bg-white/[0.08] hover:text-white/70 transition-all border border-white/[0.06]"
                  >
                    Upload Different Schedule
                  </button>
                </div>
              )}

              {currentTab === 'documents' && (
                <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Contracts & Documents</h2>
                  <DocumentsList documents={documents} onDocumentsChange={setDocuments} />
                </div>
              )}

              {currentTab === 'finance' && (
                <div className="space-y-6">
                  <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Finance Plan Generator</h2>
                    <FinancePlanForm schedule={schedule} isLoading={isLoading} onSubmit={handleGenerateFinancePlan} />
                  </div>

                  {financePlan && (
                    <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
                      <h2 className="text-xl font-bold text-white mb-4">Finance Plan</h2>
                      <FinancePlanView plan={financePlan} />
                    </div>
                  )}
                </div>
              )}

              {currentTab === 'tax-credits' && (
                <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Tax Incentive Programs</h2>
                  <TaxCreditBrowser />
                </div>
              )}
            </div>

            {error && (
              <div className="fixed bottom-4 right-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 max-w-sm backdrop-blur-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Finance Plan Form Component
function FinancePlanForm({
  schedule,
  isLoading,
  onSubmit,
}: {
  schedule: DeliverySchedule;
  isLoading: boolean;
  onSubmit: (formData: FormData) => void;
}) {
  const [title, setTitle] = useState(schedule.filmTitle);
  const [budget, setBudget] = useState('5000000');
  const [location, setLocation] = useState('');
  const [salesEstimatesFile, setSalesEstimatesFile] = useState<File | null>(null);
  const [salesAgencyFile, setSalesAgencyFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesEstimatesFile || !title || !budget || !location) {
      alert('Please fill in all required fields');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('budget', budget);
    formData.append('shootLocation', location);
    formData.append('salesEstimates', salesEstimatesFile);
    if (salesAgencyFile) {
      formData.append('salesAgency', salesAgencyFile);
    }
    onSubmit(formData);
  };

  const inputClass = "w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all";
  const labelClass = "block text-sm font-medium text-white/50 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Film Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Total Budget (USD)</label>
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Shoot Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass}>
            <option value="">Select location...</option>
            <option value="Georgia">Georgia (20%)</option>
            <option value="New Mexico">New Mexico (25%)</option>
            <option value="Louisiana">Louisiana (25%)</option>
            <option value="New York">New York (25%)</option>
            <option value="California">California (20%)</option>
            <option value="UK">UK (25.5%)</option>
            <option value="Australia">Australia (40%)</option>
            <option value="Canada">Canada (25%)</option>
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Sales Estimates Document (required)</label>
        <input type="file" accept=".docx,.pdf,.txt" onChange={(e) => setSalesEstimatesFile(e.target.files?.[0] || null)} className={inputClass} required />
        <p className="text-xs text-white/20 mt-1">Upload sales estimates (.docx, .pdf, or .txt)</p>
      </div>
      <div>
        <label className={labelClass}>Sales Agency Agreement (optional)</label>
        <input type="file" accept=".docx,.pdf,.txt" onChange={(e) => setSalesAgencyFile(e.target.files?.[0] || null)} className={inputClass} />
        <p className="text-xs text-white/20 mt-1">Upload sales agency agreement to extract commission rates</p>
      </div>
      <button
        type="submit"
        disabled={isLoading || !salesEstimatesFile}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:from-blue-500 hover:to-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? 'Generating Plan...' : 'Generate Finance Plan'}
      </button>
    </form>
  );
}
