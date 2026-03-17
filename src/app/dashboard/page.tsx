'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import FileUpload from '@/components/FileUpload';
import StatsBar from '@/components/StatsBar';
import DeliverablesTable from '@/components/DeliverablesTable';
import GapReport from '@/components/GapReport';
import DocumentsList from '@/components/DocumentsList';
import FinancePlanView from '@/components/FinancePlanView';
import TaxCreditBrowser from '@/components/TaxCreditBrowser';
import ContractReader from '@/components/ContractReader';
import ProjectWorkspace from '@/components/ProjectWorkspace';
import { DeliverySchedule, UploadedDocument, GapReport as GapReportType, FinancePlan } from '@/lib/types';

type TabType = 'project' | 'delivery' | 'documents' | 'contracts' | 'finance' | 'tax-credits';

export default function Dashboard() {
  const { data: session } = useSession();
  const [currentTab, setCurrentTab] = useState<TabType>('project');
  const [schedule, setSchedule] = useState<DeliverySchedule | null>(null);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [gapReport, setGapReport] = useState<GapReportType | null>(null);
  const [financePlan, setFinancePlan] = useState<FinancePlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  useEffect(() => {
    const handleClick = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showUserMenu]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const notify = useCallback((type: 'success' | 'info', message: string) => {
    setNotification({ type, message });
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/parse', { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse file');
      }
      const parsedSchedule: DeliverySchedule = await response.json();
      setSchedule(parsedSchedule);
      setDocuments([]);
      setGapReport(null);
      setFinancePlan(null);
      notify('success', `Parsed ${parsedSchedule.items.length} deliverables from schedule`);
      setCurrentTab('delivery');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemUpdate = (itemId: string, completed: boolean) => {
    if (!schedule) return;
    setSchedule({
      ...schedule,
      items: schedule.items.map((item) =>
        item.id === itemId ? { ...item, completed, completedDate: completed ? new Date().toISOString() : undefined } : item
      ),
      completedItems: schedule.items.filter((item) => (item.id === itemId ? completed : item.completed)).length,
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
      notify('success', `Found ${report.totalGaps} gaps across ${Object.keys(report.gapsByCategory || {}).length} categories`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze gaps');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFinancePlan = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-finance-plan', { method: 'POST', body: formData });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate finance plan');
      }
      const plan: FinancePlan = await response.json();
      setFinancePlan(plan);
      notify('success', 'Finance plan generated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate finance plan');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'project' as TabType, label: 'Project', badge: undefined as number | undefined },
    { id: 'delivery' as TabType, label: 'Delivery', badge: schedule ? schedule.items.length : undefined },
    { id: 'documents' as TabType, label: 'Documents', badge: documents.length || undefined },
    { id: 'contracts' as TabType, label: 'Contracts', badge: undefined },
    { id: 'finance' as TabType, label: 'Finance', badge: undefined },
    { id: 'tax-credits' as TabType, label: 'Tax Credits', badge: undefined },
  ];

  const userInitials = session?.user?.name
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <header className="border-b border-[#E2DACB] bg-[#FDFBF7]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded bg-[#1A1714] flex items-center justify-center">
              <span className="text-[#FDFBF7] text-[10px] font-bold tracking-tight">RD</span>
            </div>
            <span className="text-[#1A1714] font-semibold text-[15px] tracking-tight group-hover:text-[#8C8577] transition-colors">Reel Delivery</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#8C8577]/50 font-mono hidden sm:block">beta</span>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); }}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[#F5F0E8] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#1A1714] flex items-center justify-center text-[11px] font-semibold text-[#FDFBF7]">
                  {userInitials}
                </div>
                <span className="text-sm text-[#1A1714] hidden sm:block max-w-[140px] truncate">
                  {session?.user?.name || session?.user?.email || 'Account'}
                </span>
                <svg className={`w-3.5 h-3.5 text-[#8C8577] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2DACB] rounded-xl shadow-lg shadow-[#1A1714]/[0.06] overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-[#E2DACB]">
                    <p className="text-sm text-[#1A1714] font-medium truncate">{session?.user?.name || 'User'}</p>
                    <p className="text-xs text-[#8C8577] truncate">{session?.user?.email}</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-[#8C8577] hover:text-[#1A1714] hover:bg-[#F5F0E8] transition-colors">
                      Settings
                    </button>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-sm text-[#C0392B]/70 hover:text-[#C0392B] hover:bg-[#C0392B]/[0.04] transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-[#E2DACB]">
            <div className="flex overflow-x-auto -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-5 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-all ${
                    currentTab === tab.id
                      ? 'text-[#1A1714] border-[#1A1714]'
                      : 'text-[#8C8577] border-transparent hover:text-[#1A1714] hover:border-[#E2DACB]'
                  }`}
                >
                  {tab.label}
                  {tab.badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-[#F5F0E8] text-[#8C8577]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {currentTab === 'project' && (
              <div className="bg-white rounded-xl border border-[#E2DACB] p-6">
                <h2 className="text-xl font-semibold text-[#1A1714] mb-2">Project Workspace</h2>
                <p className="text-sm text-[#8C8577] mb-6" style={{ fontFamily: 'Georgia, serif' }}>Upload all your documents — delivery schedules, contracts, sales estimates — and we&apos;ll build everything automatically.</p>
                <ProjectWorkspace />
              </div>
            )}

            {currentTab === 'delivery' && (
              <>
                {schedule ? (
                  <div className="space-y-6">
                    <StatsBar schedule={schedule} />
                    <div className="bg-white rounded-xl border border-[#E2DACB] p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-[#1A1714]">Deliverables</h2>
                        <button
                          onClick={handleAnalyzeGaps}
                          disabled={isLoading}
                          className="px-4 py-2 text-sm bg-[#1A1714] text-[#FDFBF7] font-medium rounded-lg hover:bg-[#2A2720] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          {isLoading ? 'Analyzing...' : 'Run Gap Analysis'}
                        </button>
                      </div>
                      <DeliverablesTable schedule={schedule} onItemUpdate={handleItemUpdate} />
                    </div>
                    {gapReport && (
                      <div className="bg-white rounded-xl border border-[#E2DACB] p-6">
                        <h2 className="text-xl font-semibold text-[#1A1714] mb-4">Gap Analysis Report</h2>
                        <GapReport report={gapReport} filmTitle={schedule.filmTitle} distributor={schedule.distributor} />
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    title="No delivery schedule loaded"
                    description="Upload a delivery schedule in the Project tab to start tracking deliverables, or upload one directly here."
                    action={<FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} error={error} />}
                  />
                )}
              </>
            )}

            {currentTab === 'documents' && (
              <div className="bg-white rounded-xl border border-[#E2DACB] p-6">
                <h2 className="text-xl font-semibold text-[#1A1714] mb-2">Documents</h2>
                <p className="text-sm text-[#8C8577] mb-6" style={{ fontFamily: 'Georgia, serif' }}>Upload contracts, agreements, and supporting documents. We&apos;ll classify and match them to your deliverables.</p>
                <DocumentsList documents={documents} onDocumentsChange={setDocuments} />
              </div>
            )}

            {currentTab === 'contracts' && (
              <div className="bg-white rounded-xl border border-[#E2DACB] p-6">
                <h2 className="text-xl font-semibold text-[#1A1714] mb-2">AI Contract Reader</h2>
                <p className="text-sm text-[#8C8577] mb-6" style={{ fontFamily: 'Georgia, serif' }}>Upload a distribution agreement and we&apos;ll extract key terms, red flags, and delivery obligations.</p>
                <ContractReader />
              </div>
            )}

            {currentTab === 'finance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-[#E2DACB] p-6">
                  <h2 className="text-xl font-semibold text-[#1A1714] mb-2">Finance Plan Generator</h2>
                  <p className="text-sm text-[#8C8577] mb-6" style={{ fontFamily: 'Georgia, serif' }}>Build a complete capital stack with territory breakdowns, tax incentives, and revenue projections.</p>
                  {schedule ? (
                    <FinancePlanForm schedule={schedule} isLoading={isLoading} onSubmit={handleGenerateFinancePlan} />
                  ) : (
                    <div className="bg-[#F5F0E8] rounded-lg p-6 text-center">
                      <p className="text-[#8C8577] text-sm mb-3" style={{ fontFamily: 'Georgia, serif' }}>Upload a delivery schedule first to auto-populate film details, or use the Project tab to upload all documents at once.</p>
                      <button onClick={() => setCurrentTab('project')} className="text-sm text-[#B8860B] hover:text-[#9A7209] font-medium transition-colors">
                        Go to Project tab
                      </button>
                    </div>
                  )}
                </div>
                {financePlan && (
                  <div className="bg-white rounded-xl border border-[#E2DACB] p-6">
                    <h2 className="text-xl font-semibold text-[#1A1714] mb-4">Finance Plan</h2>
                    <FinancePlanView plan={financePlan} />
                  </div>
                )}
              </div>
            )}

            {currentTab === 'tax-credits' && (
              <div className="bg-white rounded-xl border border-[#E2DACB] p-6">
                <h2 className="text-xl font-semibold text-[#1A1714] mb-2">Tax Incentive Programs</h2>
                <p className="text-sm text-[#8C8577] mb-6" style={{ fontFamily: 'Georgia, serif' }}>Browse and compare incentive programs across 20+ jurisdictions worldwide.</p>
                <TaxCreditBrowser />
              </div>
            )}
          </div>

          {/* Error Toast */}
          {error && (
            <div className="fixed bottom-4 right-4 bg-white border border-[#C0392B]/20 rounded-xl p-4 max-w-sm shadow-lg z-50">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#C0392B]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[#C0392B] text-xs font-bold">!</span>
                </div>
                <div>
                  <p className="text-[#C0392B] text-sm">{error}</p>
                  <button onClick={() => setError(null)} className="text-xs text-[#8C8577] hover:text-[#1A1714] mt-1">Dismiss</button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Toast */}
          {notification && (
            <div className={`fixed bottom-4 right-4 rounded-xl p-4 max-w-sm shadow-lg z-50 bg-white border ${
              notification.type === 'success' ? 'border-[#2D7A4F]/20' : 'border-[#B8860B]/20'
            }`}>
              <p className={`text-sm ${notification.type === 'success' ? 'text-[#2D7A4F]' : 'text-[#B8860B]'}`}>{notification.message}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2DACB] p-12 text-center">
      <h3 className="text-lg font-semibold text-[#1A1714] mb-2">{title}</h3>
      <p className="text-sm text-[#8C8577] max-w-md mx-auto mb-6" style={{ fontFamily: 'Georgia, serif' }}>{description}</p>
      {action && <div className="max-w-xl mx-auto">{action}</div>}
    </div>
  );
}

function FinancePlanForm({ schedule, isLoading, onSubmit }: { schedule: DeliverySchedule; isLoading: boolean; onSubmit: (formData: FormData) => void }) {
  const [title, setTitle] = useState(schedule.filmTitle);
  const [budget, setBudget] = useState('5000000');
  const [location, setLocation] = useState('');
  const [salesEstimatesFile, setSalesEstimatesFile] = useState<File | null>(null);
  const [salesAgencyFile, setSalesAgencyFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesEstimatesFile || !title || !budget || !location) { alert('Please fill in all required fields'); return; }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('budget', budget);
    formData.append('shootLocation', location);
    formData.append('salesEstimates', salesEstimatesFile);
    if (salesAgencyFile) formData.append('salesAgency', salesAgencyFile);
    onSubmit(formData);
  };

  const inputClass = "w-full px-4 py-2.5 bg-[#FDFBF7] border border-[#E2DACB] rounded-lg text-[#1A1714] placeholder-[#8C8577]/50 focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]/40 transition-all";
  const labelClass = "block text-sm font-medium text-[#8C8577] mb-2";

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
      </div>
      <div>
        <label className={labelClass}>Sales Agency Agreement (optional)</label>
        <input type="file" accept=".docx,.pdf,.txt" onChange={(e) => setSalesAgencyFile(e.target.files?.[0] || null)} className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={isLoading || !salesEstimatesFile}
        className="w-full px-6 py-3 bg-[#1A1714] text-[#FDFBF7] font-medium rounded-xl hover:bg-[#2A2720] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? 'Generating Plan...' : 'Generate Finance Plan'}
      </button>
    </form>
  );
}
