'use client';

import React, { useState, useCallback } from 'react';
import type { ContractAnalysis } from '@/lib/contract-reader';

export default function ContractReader() {
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');

  const handleUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-contract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Analysis failed');
      }

      const result: ContractAnalysis = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze contract');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-white/40 text-sm">Analyzing {fileName}...</p>
        <p className="text-white/20 text-xs mt-1">Extracting terms, obligations, and red flags</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-white/[0.08] rounded-xl p-12 text-center hover:border-blue-500/30 transition-colors cursor-pointer"
          onClick={() => document.getElementById('contract-file-input')?.click()}
        >
          <svg className="w-10 h-10 mx-auto mb-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-white/50 text-sm mb-1">Drop your distribution agreement here</p>
          <p className="text-white/20 text-xs">PDF, DOCX, or TXT</p>
          <input
            id="contract-file-input"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    );
  }

  const highFlags = analysis.redFlags.filter(f => f.severity === 'high');
  const medFlags = analysis.redFlags.filter(f => f.severity === 'medium');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wider">{analysis.documentType}</p>
          <p className="text-sm text-white/50 mt-1">{fileName}</p>
        </div>
        <button
          onClick={() => { setAnalysis(null); setFileName(''); }}
          className="text-xs text-white/30 hover:text-white/60 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] transition-colors"
        >
          Analyze another
        </button>
      </div>

      {/* Summary */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-5">
        <h3 className="text-sm font-medium text-blue-400/80 mb-2">Summary</h3>
        <p className="text-sm text-white/50 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-center">
          <p className="text-2xl font-bold text-white">{analysis.keyTerms.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Key Terms</p>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-center">
          <p className="text-2xl font-bold text-white">{analysis.deliveryObligations.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Obligations</p>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-center">
          <p className="text-2xl font-bold text-white">{analysis.territories.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Territories</p>
        </div>
        <div className={`rounded-xl border p-4 text-center ${highFlags.length > 0 ? 'bg-red-500/5 border-red-500/10' : 'bg-white/[0.02] border-white/[0.04]'}`}>
          <p className={`text-2xl font-bold ${highFlags.length > 0 ? 'text-red-400' : 'text-white'}`}>{analysis.redFlags.length}</p>
          <p className="text-[11px] text-white/30 mt-1">Red Flags</p>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
          <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Licensor / Producer</p>
          <p className="text-sm text-white/70">{analysis.parties.licensor}</p>
        </div>
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
          <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1">Licensee / Distributor</p>
          <p className="text-sm text-white/70">{analysis.parties.licensee}</p>
        </div>
      </div>

      {/* Red Flags */}
      {analysis.redFlags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-3">Red Flags</h3>
          <div className="space-y-2">
            {analysis.redFlags.map((flag, i) => (
              <div key={i} className={`rounded-xl border p-4 ${
                flag.severity === 'high' ? 'bg-red-500/5 border-red-500/10' :
                flag.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/10' :
                'bg-white/[0.02] border-white/[0.04]'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    flag.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                    flag.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-white/[0.06] text-white/40'
                  }`}>{flag.severity}</span>
                  <span className="text-xs text-white/30">{flag.category}</span>
                </div>
                <p className="text-sm text-white/70 font-medium mb-1">{flag.issue}</p>
                <p className="text-xs text-white/30 mb-2 italic">{flag.detail}</p>
                <p className="text-xs text-emerald-400/60">{flag.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Terms */}
      {analysis.keyTerms.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-3">Key Terms</h3>
          <div className="rounded-xl border border-white/[0.04] overflow-hidden">
            {analysis.keyTerms.map((term, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.02] last:border-0">
                <div>
                  <span className="text-xs text-white/20 uppercase tracking-wider">{term.category}</span>
                  <p className="text-sm text-white/60">{term.term}</p>
                </div>
                <span className="text-sm text-white/80 font-medium">{term.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Obligations */}
      {analysis.deliveryObligations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-3">Delivery Obligations</h3>
          <div className="rounded-xl border border-white/[0.04] overflow-hidden">
            {analysis.deliveryObligations.map((ob, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.02] last:border-0">
                <span className="text-sm text-white/60">{ob.item}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  ob.priority === 'critical' ? 'bg-red-500/15 text-red-400' :
                  ob.priority === 'high' ? 'bg-orange-500/15 text-orange-400' :
                  ob.priority === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-white/[0.06] text-white/40'
                }`}>{ob.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Territories & Rights */}
      <div className="grid grid-cols-2 gap-4">
        {analysis.territories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/60 mb-3">Territories</h3>
            <div className="flex flex-wrap gap-1.5">
              {analysis.territories.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/40">{t}</span>
              ))}
            </div>
          </div>
        )}
        {analysis.rights.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-white/60 mb-3">Rights Granted</h3>
            <div className="flex flex-wrap gap-1.5">
              {analysis.rights.map((r) => (
                <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/10 text-violet-400/60">{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Financial Terms */}
      {analysis.financialTerms.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-3">Financial Terms</h3>
          <div className="space-y-2">
            {analysis.financialTerms.map((ft, i) => (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/30 uppercase tracking-wider">{ft.type}</span>
                  {ft.amount && <span className="text-sm font-medium text-emerald-400">{ft.amount}</span>}
                  {ft.percentage && <span className="text-sm font-medium text-blue-400">{ft.percentage}</span>}
                </div>
                <p className="text-xs text-white/40">{ft.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
