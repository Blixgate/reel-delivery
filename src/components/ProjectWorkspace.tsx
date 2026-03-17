'use client';

import React, { useState, useCallback } from 'react';
import type { ContractAnalysis } from '@/lib/contract-reader';
import type { FinancePlan, GapReport as GapReportType } from '@/lib/types';

interface ProjectDocument {
  id: string;
  name: string;
  type: 'delivery-schedule' | 'contract' | 'sales-estimates' | 'other';
  status: 'uploading' | 'processing' | 'ready' | 'error';
  file: File;
}

interface ProjectState {
  documents: ProjectDocument[];
  deliverables: DeliverableItem[];
  contractAnalysis: ContractAnalysis | null;
  financePlan: FinancePlan | null;
  gapReport: GapReportType | null;
  isProcessing: boolean;
  processingStep: string;
}

interface DeliverableItem {
  id: string;
  name: string;
  category: string;
  status: 'not-started' | 'in-progress' | 'complete' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  deadline?: string;
  progress: number;
  notes?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Technical': 'bg-blue-500/15 text-blue-400',
  'Audio': 'bg-violet-500/15 text-violet-400',
  'Marketing': 'bg-pink-500/15 text-pink-400',
  'Legal': 'bg-amber-500/15 text-amber-400',
  'Accessibility': 'bg-emerald-500/15 text-emerald-400',
  'Financial': 'bg-cyan-500/15 text-cyan-400',
  'default': 'bg-white/[0.06] text-white/40',
};

const STATUS_COLORS: Record<string, string> = {
  'not-started': 'text-white/30',
  'in-progress': 'text-amber-400',
  'complete': 'text-emerald-400',
  'blocked': 'text-red-400',
};

export default function ProjectWorkspace() {
  const [project, setProject] = useState<ProjectState>({
    documents: [],
    deliverables: [],
    contractAnalysis: null,
    financePlan: null,
    gapReport: null,
    isProcessing: false,
    processingStep: '',
  });

  const [activeView, setActiveView] = useState<'upload' | 'deliverables' | 'contract' | 'finance'>('upload');

  const classifyFile = (filename: string): ProjectDocument['type'] => {
    const lower = filename.toLowerCase();
    if (/delivery|schedule/i.test(lower)) return 'delivery-schedule';
    if (/contract|agreement|deal|license|distribution/i.test(lower)) return 'contract';
    if (/sales|estimates|territory|for\s+sales/i.test(lower)) return 'sales-estimates';
    return 'other';
  };

  const handleFileDrop = useCallback(async (files: FileList) => {
    const newDocs: ProjectDocument[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: classifyFile(file.name),
      status: 'ready' as const,
      file,
    }));

    setProject(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocs],
    }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileDrop(e.dataTransfer.files);
  }, [handleFileDrop]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFileDrop(e.target.files);
  }, [handleFileDrop]);

  const removeDocument = (id: string) => {
    setProject(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id),
    }));
  };

  const changeDocType = (id: string, type: ProjectDocument['type']) => {
    setProject(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.id === id ? { ...d, type } : d),
    }));
  };

  const processAll = async () => {
    if (project.documents.length === 0) return;

    setProject(prev => ({ ...prev, isProcessing: true }));
    const allDeliverables: DeliverableItem[] = [];
    let contractResult: ContractAnalysis | null = null;
    let financeResult: FinancePlan | null = null;

    try {
      // 1. Process delivery schedules
      const schedules = project.documents.filter(d => d.type === 'delivery-schedule');
      for (const doc of schedules) {
        setProject(prev => ({ ...prev, processingStep: `Parsing delivery schedule: ${doc.name}` }));
        const formData = new FormData();
        formData.append('file', doc.file);
        const res = await fetch('/api/parse', { method: 'POST', body: formData });
        if (res.ok) {
          const schedule = await res.json();
          // Convert schedule items to deliverables
          for (const item of schedule.items || []) {
            allDeliverables.push({
              id: item.id || crypto.randomUUID(),
              name: item.name || item.description || 'Unnamed item',
              category: item.category || 'General',
              status: item.completed ? 'complete' : 'not-started',
              priority: item.priority || 'medium',
              source: doc.name,
              progress: item.completed ? 100 : 0,
            });
          }
        }
      }

      // 2. Process contracts
      const contracts = project.documents.filter(d => d.type === 'contract');
      for (const doc of contracts) {
        setProject(prev => ({ ...prev, processingStep: `Analyzing contract: ${doc.name}` }));
        const formData = new FormData();
        formData.append('file', doc.file);
        const res = await fetch('/api/analyze-contract', { method: 'POST', body: formData });
        if (res.ok) {
          contractResult = await res.json();
          // Add contract obligations as deliverables
          for (const ob of contractResult?.deliveryObligations || []) {
            const existing = allDeliverables.find(d => d.name.toLowerCase().includes(ob.item.toLowerCase().split(' ')[0]));
            if (!existing) {
              allDeliverables.push({
                id: crypto.randomUUID(),
                name: ob.item,
                category: 'Contract Obligation',
                status: 'not-started',
                priority: ob.priority,
                source: `Contract: ${doc.name}`,
                deadline: ob.deadline,
                progress: 0,
              });
            }
          }
        }
      }

      // 3. Process sales estimates → finance plan
      const salesDocs = project.documents.filter(d => d.type === 'sales-estimates');
      if (salesDocs.length > 0) {
        setProject(prev => ({ ...prev, processingStep: 'Generating finance plan from sales estimates...' }));
        const formData = new FormData();
        formData.append('salesEstimates', salesDocs[0].file);
        formData.append('title', 'Project');
        formData.append('budget', '5000000');
        formData.append('shootLocation', 'Georgia');

        // If there's a contract with sales agency info, add it
        if (contracts.length > 0) {
          formData.append('salesAgency', contracts[0].file);
        }

        const res = await fetch('/api/generate-finance-plan', { method: 'POST', body: formData });
        if (res.ok) {
          financeResult = await res.json();
        }
      }

      // 4. Set the results
      setProject(prev => ({
        ...prev,
        deliverables: allDeliverables,
        contractAnalysis: contractResult,
        financePlan: financeResult,
        isProcessing: false,
        processingStep: '',
      }));

      // Auto-switch to deliverables view if we got results
      if (allDeliverables.length > 0) {
        setActiveView('deliverables');
      }

    } catch (error) {
      console.error('Processing error:', error);
      setProject(prev => ({ ...prev, isProcessing: false, processingStep: '' }));
    }
  };

  const updateDeliverable = (id: string, updates: Partial<DeliverableItem>) => {
    setProject(prev => ({
      ...prev,
      deliverables: prev.deliverables.map(d =>
        d.id === id ? { ...d, ...updates } : d
      ),
    }));
  };

  const totalDeliverables = project.deliverables.length;
  const completedCount = project.deliverables.filter(d => d.status === 'complete').length;
  const criticalCount = project.deliverables.filter(d => d.priority === 'critical' && d.status !== 'complete').length;
  const overallProgress = totalDeliverables > 0 ? Math.round((completedCount / totalDeliverables) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Processing overlay */}
      {project.isProcessing && (
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-6 flex items-center gap-4">
          <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin shrink-0" />
          <div>
            <p className="text-sm text-white/60 font-medium">Processing documents...</p>
            <p className="text-xs text-white/30 mt-0.5">{project.processingStep}</p>
          </div>
        </div>
      )}

      {/* Progress bar (if we have deliverables) */}
      {totalDeliverables > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
            <p className="text-[11px] text-white/30 uppercase tracking-wider">Progress</p>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-2xl font-bold text-white">{overallProgress}%</p>
              <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
            <p className="text-[11px] text-white/30 uppercase tracking-wider">Deliverables</p>
            <p className="text-2xl font-bold text-white mt-2">{completedCount}<span className="text-white/20 text-lg">/{totalDeliverables}</span></p>
          </div>
          <div className={`rounded-xl border p-4 ${criticalCount > 0 ? 'bg-red-500/5 border-red-500/10' : 'bg-white/[0.02] border-white/[0.04]'}`}>
            <p className="text-[11px] text-white/30 uppercase tracking-wider">Critical Items</p>
            <p className={`text-2xl font-bold mt-2 ${criticalCount > 0 ? 'text-red-400' : 'text-white'}`}>{criticalCount}</p>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
            <p className="text-[11px] text-white/30 uppercase tracking-wider">Documents</p>
            <p className="text-2xl font-bold text-white mt-2">{project.documents.length}</p>
          </div>
        </div>
      )}

      {/* Sub-navigation */}
      {totalDeliverables > 0 && (
        <div className="flex gap-1 p-1 bg-white/[0.02] rounded-lg border border-white/[0.04] w-fit">
          {[
            { id: 'deliverables' as const, label: 'Deliverables' },
            { id: 'upload' as const, label: 'Documents' },
            ...(project.contractAnalysis ? [{ id: 'contract' as const, label: 'Contract Analysis' }] : []),
            ...(project.financePlan ? [{ id: 'finance' as const, label: 'Finance Plan' }] : []),
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === v.id ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:text-white/50'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}

      {/* Upload area */}
      {activeView === 'upload' && (
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-white/[0.08] rounded-xl p-10 text-center hover:border-blue-500/30 transition-colors cursor-pointer"
            onClick={() => document.getElementById('project-file-input')?.click()}
          >
            <svg className="w-10 h-10 mx-auto mb-4 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            <p className="text-white/50 text-sm mb-1">Drop all your project documents here</p>
            <p className="text-white/20 text-xs">Delivery schedules, contracts, sales estimates — we&apos;ll sort them automatically</p>
            <input
              id="project-file-input"
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Document list */}
          {project.documents.length > 0 && (
            <div className="space-y-2">
              {project.documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <svg className="w-4 h-4 text-white/20 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="text-sm text-white/60 flex-1 truncate">{doc.name}</span>
                  <select
                    value={doc.type}
                    onChange={(e) => changeDocType(doc.id, e.target.value as ProjectDocument['type'])}
                    className="text-xs bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1 text-white/50 focus:outline-none"
                  >
                    <option value="delivery-schedule">Delivery Schedule</option>
                    <option value="contract">Contract</option>
                    <option value="sales-estimates">Sales Estimates</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="text-white/20 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              <button
                onClick={processAll}
                disabled={project.isProcessing}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium rounded-xl hover:from-blue-500 hover:to-violet-500 disabled:opacity-30 transition-all text-sm"
              >
                {project.isProcessing ? 'Processing...' : `Process ${project.documents.length} document${project.documents.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Deliverables tracker */}
      {activeView === 'deliverables' && (
        <div className="space-y-3">
          {/* Group by category */}
          {Object.entries(
            project.deliverables.reduce((acc, d) => {
              (acc[d.category] = acc[d.category] || []).push(d);
              return acc;
            }, {} as Record<string, DeliverableItem[]>)
          ).map(([category, items]) => (
            <div key={category} className="rounded-xl border border-white/[0.04] overflow-hidden">
              <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04] flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${CATEGORY_COLORS[category] || CATEGORY_COLORS.default}`}>
                  {category}
                </span>
                <span className="text-[11px] text-white/20">
                  {items.filter(i => i.status === 'complete').length}/{items.length}
                </span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.02] last:border-0 group">
                  {/* Checkbox */}
                  <button
                    onClick={() => updateDeliverable(item.id, {
                      status: item.status === 'complete' ? 'not-started' : 'complete',
                      progress: item.status === 'complete' ? 0 : 100,
                    })}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      item.status === 'complete'
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-white/[0.12] hover:border-white/[0.25]'
                    }`}
                  >
                    {item.status === 'complete' && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Name */}
                  <span className={`text-sm flex-1 ${item.status === 'complete' ? 'text-white/30 line-through' : 'text-white/70'}`}>
                    {item.name}
                  </span>

                  {/* Priority badge */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    item.priority === 'critical' ? 'bg-red-500/15 text-red-400' :
                    item.priority === 'high' ? 'bg-orange-500/15 text-orange-400' :
                    item.priority === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                    'bg-white/[0.06] text-white/30'
                  }`}>{item.priority}</span>

                  {/* Status dropdown */}
                  <select
                    value={item.status}
                    onChange={(e) => updateDeliverable(item.id, {
                      status: e.target.value as DeliverableItem['status'],
                      progress: e.target.value === 'complete' ? 100 : e.target.value === 'in-progress' ? 50 : 0,
                    })}
                    className={`text-xs bg-transparent border-0 focus:outline-none cursor-pointer ${STATUS_COLORS[item.status]}`}
                  >
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="complete">Complete</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Contract analysis view */}
      {activeView === 'contract' && project.contractAnalysis && (
        <div className="space-y-4">
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5">
            <h3 className="text-sm font-medium text-blue-400/80 mb-2">Contract Summary</h3>
            <p className="text-sm text-white/50 leading-relaxed">{project.contractAnalysis.summary}</p>
          </div>

          {project.contractAnalysis.redFlags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-white/60">Red Flags ({project.contractAnalysis.redFlags.length})</h3>
              {project.contractAnalysis.redFlags.map((flag, i) => (
                <div key={i} className={`rounded-xl border p-4 ${
                  flag.severity === 'high' ? 'bg-red-500/5 border-red-500/10' :
                  flag.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/10' :
                  'bg-white/[0.02] border-white/[0.04]'
                }`}>
                  <p className="text-sm text-white/70 font-medium">{flag.issue}</p>
                  <p className="text-xs text-emerald-400/60 mt-1">{flag.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {project.contractAnalysis.keyTerms.length > 0 && (
            <div className="rounded-xl border border-white/[0.04] overflow-hidden">
              <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
                <span className="text-xs text-white/30 font-medium">Key Terms</span>
              </div>
              {project.contractAnalysis.keyTerms.map((term, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.02] last:border-0">
                  <span className="text-sm text-white/50">{term.term}</span>
                  <span className="text-sm text-white/80 font-medium">{term.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Finance plan view */}
      {activeView === 'finance' && project.financePlan && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">
              <p className="text-[11px] text-white/30 uppercase tracking-wider">Total MG</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                ${((project.financePlan.salesEstimates?.reduce((sum, t) => sum + t.mgValue, 0) || 0) / 1_000_000).toFixed(1)}M
              </p>
            </div>
            <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4">
              <p className="text-[11px] text-white/30 uppercase tracking-wider">Budget</p>
              <p className="text-xl font-bold text-blue-400 mt-1">
                ${((project.financePlan.totalBudget || 0) / 1_000_000).toFixed(1)}M
              </p>
            </div>
            <div className="rounded-xl bg-violet-500/5 border border-violet-500/10 p-4">
              <p className="text-[11px] text-white/30 uppercase tracking-wider">Territories</p>
              <p className="text-xl font-bold text-violet-400 mt-1">
                {project.financePlan.salesEstimates?.length || 0}
              </p>
            </div>
          </div>

          {/* Territory breakdown */}
          {project.financePlan.salesEstimates && project.financePlan.salesEstimates.length > 0 && (
            <div className="rounded-xl border border-white/[0.04] overflow-hidden">
              <div className="grid grid-cols-3 gap-4 px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.04]">
                <span className="text-[11px] text-white/20 uppercase tracking-wider">Territory</span>
                <span className="text-[11px] text-white/20 uppercase tracking-wider">MG</span>
                <span className="text-[11px] text-white/20 uppercase tracking-wider">Status</span>
              </div>
              {project.financePlan.salesEstimates.slice(0, 15).map((t, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 px-4 py-2.5 border-b border-white/[0.02] last:border-0">
                  <span className="text-sm text-white/60">{t.territory}</span>
                  <span className="text-sm text-white/70 font-medium">
                    ${(t.mgValue / 1_000).toFixed(0)}K
                  </span>
                  <span className={`text-xs font-medium ${t.status === 'sold' ? 'text-emerald-400' : 'text-white/30'}`}>
                    {t.status || 'Estimated'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
