'use client';

import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import StatsBar from '@/components/StatsBar';
import DeliverablesTable from '@/components/DeliverablesTable';
import GapReport from '@/components/GapReport';
import DocumentsList from '@/components/DocumentsList';
import FinancePlanView from '@/components/FinancePlanView';
import TaxCreditBrowser from '@/components/TaxCreditBrowser';
import { DeliverySchedule, UploadedDocument, GapReport as GapReportType, FinancePlan } from '@/lib/types';

type TabType = 'delivery' | 'documents' | 'finance' | 'tax-credits';

export default function Home() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-[#1B3A5C] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
            <h1 className="text-3xl font-bold">Reel Delivery</h1>
          </div>
          <p className="text-blue-100 text-sm">
            Professional Delivery Schedule & Finance Planning Dashboard
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!schedule ? (
          // Initial Upload State
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-[#1B3A5C] mb-6">
                Upload Your Delivery Schedule
              </h2>
              <FileUpload
                onFileUpload={handleFileUpload}
                isLoading={isLoading}
                error={error}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">How to use:</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex gap-2">
                  <span>1.</span>
                  <span>Upload your delivery schedule document (.docx, .pdf, or .txt)</span>
                </li>
                <li className="flex gap-2">
                  <span>2.</span>
                  <span>Upload contracts and agreements to track fulfillment</span>
                </li>
                <li className="flex gap-2">
                  <span>3.</span>
                  <span>Analyze gaps to identify missing deliverables</span>
                </li>
                <li className="flex gap-2">
                  <span>4.</span>
                  <span>Generate a finance plan with tax incentives</span>
                </li>
                <li className="flex gap-2">
                  <span>5.</span>
                  <span>Browse and compare tax credit programs by jurisdiction</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          // Tabbed Dashboard
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-20 z-40">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                <button
                  onClick={() => setCurrentTab('delivery')}
                  className={`px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    currentTab === 'delivery'
                      ? 'text-[#1B3A5C] border-[#1B3A5C]'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Delivery
                </button>
                <button
                  onClick={() => setCurrentTab('documents')}
                  className={`px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    currentTab === 'documents'
                      ? 'text-[#1B3A5C] border-[#1B3A5C]'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Documents
                </button>
                <button
                  onClick={() => setCurrentTab('finance')}
                  className={`px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    currentTab === 'finance'
                      ? 'text-[#1B3A5C] border-[#1B3A5C]'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Finance
                </button>
                <button
                  onClick={() => setCurrentTab('tax-credits')}
                  className={`px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    currentTab === 'tax-credits'
                      ? 'text-[#1B3A5C] border-[#1B3A5C]'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Tax Credits
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* Delivery Tab */}
              {currentTab === 'delivery' && (
                <div className="space-y-6">
                  <StatsBar schedule={schedule} />

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-[#1B3A5C] mb-4">
                      Deliverables
                    </h2>
                    <DeliverablesTable
                      schedule={schedule}
                      onItemUpdate={handleItemUpdate}
                    />
                  </div>

                  {gapReport && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h2 className="text-2xl font-bold text-[#1B3A5C] mb-4">
                        Gap Analysis Report
                      </h2>
                      <GapReport
                        report={gapReport}
                        filmTitle={schedule.filmTitle}
                        distributor={schedule.distributor}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleAnalyzeGaps}
                    disabled={isLoading || documents.length === 0}
                    className="w-full px-6 py-3 bg-[#1B3A5C] text-white font-medium rounded-lg hover:bg-[#2E5D8A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    className="w-full px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Upload Different Schedule
                  </button>
                </div>
              )}

              {/* Documents Tab */}
              {currentTab === 'documents' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-[#1B3A5C] mb-4">
                    Contracts & Documents
                  </h2>
                  <DocumentsList
                    documents={documents}
                    onDocumentsChange={setDocuments}
                  />
                </div>
              )}

              {/* Finance Tab */}
              {currentTab === 'finance' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-[#1B3A5C] mb-4">
                      Finance Plan Generator
                    </h2>

                    <FinancePlanForm
                      schedule={schedule}
                      isLoading={isLoading}
                      onSubmit={handleGenerateFinancePlan}
                    />
                  </div>

                  {financePlan && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h2 className="text-2xl font-bold text-[#1B3A5C] mb-4">
                        Finance Plan
                      </h2>
                      <FinancePlanView plan={financePlan} />
                    </div>
                  )}
                </div>
              )}

              {/* Tax Credits Tab */}
              {currentTab === 'tax-credits' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-[#1B3A5C] mb-4">
                    Tax Incentive Programs
                  </h2>
                  <TaxCreditBrowser />
                </div>
              )}
            </div>

            {error && (
              <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-12 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-white mb-2">Product</h3>
              <p className="text-sm">Professional delivery schedule management and financial planning for film producers.</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Features</h3>
              <ul className="text-sm space-y-1">
                <li>Delivery schedule parsing</li>
                <li>Document classification</li>
                <li>Gap analysis</li>
                <li>Finance planning</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Resources</h3>
              <ul className="text-sm space-y-1">
                <li>Tax incentive database</li>
                <li>Territory breakdown</li>
                <li>Capital stack modeling</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm">
            <p>
              Reel Delivery v2.0 - Professional Delivery Schedule & Finance Planning Dashboard for Film Producers
            </p>
          </div>
        </div>
      </footer>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Film Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5D8A]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Budget (USD)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5D8A]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shoot Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5D8A]"
          >
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sales Estimates Document (required)
        </label>
        <input
          type="file"
          accept=".docx,.pdf,.txt"
          onChange={(e) => setSalesEstimatesFile(e.target.files?.[0] || null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5D8A]"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload sales estimates (.docx, .pdf, or .txt)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sales Agency Agreement (optional)
        </label>
        <input
          type="file"
          accept=".docx,.pdf,.txt"
          onChange={(e) => setSalesAgencyFile(e.target.files?.[0] || null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E5D8A]"
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload sales agency agreement to extract commission rates
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || !salesEstimatesFile}
        className="w-full px-6 py-3 bg-[#1B3A5C] text-white font-medium rounded-lg hover:bg-[#2E5D8A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Generating Plan...' : 'Generate Finance Plan'}
      </button>
    </form>
  );
}
