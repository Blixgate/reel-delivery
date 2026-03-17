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
        <div className="w-8 h-8 border-2 border-[#B8860B]/30 border-t-[#B8860B] rounded-full animate-spin mb-4" />
        <p className="text-[#8C8577] text-sm">Analyzing {fileName}...</p>
        <p className="text-[#8C8577]/60 text-xs mt-1" style={{ fontFamily: 'Georgia, serif' }}>Extracting terms, obligations, and red flags</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-[#E2DACB] rounded-xl p-12 text-center hover:border-[#B8860B]/40 transition-colors cursor-pointer"
          onClick={() => document.getElementById('contract-file-input')?.click()}
        >
          <svg className="w-10 h-10 mx-auto mb-4 text-[#E2DACB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-[#8C8577] text-sm mb-1">Drop your distribution agreement here</p>
          <p className="text-[#8C8577]/60 text-xs" style={{ fontFamily: 'Georgia, serif' }}>PDF, DOCX, or TXT</p>
          <input
            id="contract-file-input"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
        {error && (
          <div className="mt-4 bg-[#C0392B]/5 border border-[#C0392B]/15 rounded-lg p-3">
            <p className="text-[#C0392B] text-sm">{error}</p>
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
          <p className="text-xs text-[#8C8577] uppercase tracking-wider">{analysis.documentType}</p>
          <p className="text-sm text-[#8C8577]/80 mt-1" style={{ fontFamily: 'Georgia, serif' }}>{fileName}</p>
        </div>
        <button
          onClick={() => { setAnalysis(null); setFileName(''); }}
          className="text-xs text-[#8C8577] hover:text-[#1A1714] px-3 py-1.5 rounded-lg bg-[#F5F0E8] border border-[#E2DACB] transition-colors"
        >
          Analyze another
        </button>
      </div>

      {/* Summary */}
      <div className="bg-[#F5F0E8]/50 border border-[#E2DACB] rounded-xl p-5">
        <h3 className="text-sm font-medium text-[#B8860B] mb-2">Summary</h3>
        <p className="text-sm text-[#8C8577] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>{analysis.summary}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl bg-white border border-[#E2DACB] p-4 text-center">
          <p className="text-2xl font-bold text-[#1A1714]">{analysis.keyTerms.length}</p>
          <p className="text-[11px] text-[#8C8577] mt-1">Key Terms</p>
        </div>
        <div className="rounded-xl bg-white border border-[#E2DACB] p-4 text-center">
          <p className="text-2xl font-bold text-[#1A1714]">{analysis.deliveryObligations.length}</p>
          <p className="text-[11px] text-[#8C8577] mt-1">Obligations</p>
        </div>
        <div className="rounded-xl bg-white border border-[#E2DACB] p-4 text-center">
          <p className="text-2xl font-bold text-[#1A1714]">{analysis.territories.length}</p>
          <p className="text-[11px] text-[#8C8577] mt-1">Territories</p>
        </div>
        <div className={`rounded-xl border p-4 text-center ${highFlags.length > 0 ? 'bg-[#C0392B]/5 border-[#C0392B]/15' : 'bg-white border-[#E2DACB]'}`}>
          <p className={`text-2xl font-bold ${highFlags.length > 0 ? 'text-[#C0392B]' : 'text-[#1A1714]'}`}>{analysis.redFlags.length}</p>
          <p className="text-[11px] text-[#8C8577] mt-1">Red Flags</p>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white border border-[#E2DACB] p-4">
          <p className="text-[11px] text-[#8C8577] uppercase tracking-wider mb-1">Licensor / Producer</p>
          <p className="text-sm text-[#1A1714]">{analysis.parties.licensor}</p>
        </div>
        <div className="rounded-xl bg-white border border-[#E2DACB] p-4">
          <p className="text-[11px] text-[#8C8577] uppercase tracking-wider mb-1">Licensee / Distributor</p>
          <p className="text-sm text-[#1A1714]">{analysis.parties.licensee}</p>
        </div>
      </div>

      {/* Red Flags */}
      {analysis.redFlags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#1A1714] mb-3">Red Flags</h3>
          <div className="space-y-2">
            {analysis.redFlags.map((flag, i) => (
              <div key={i} className={`rounded-xl border p-4 ${
                flag.severity === 'high' ? 'bg-[#C0392B]/5 border-[#C0392B]/15' :
                flag.severity === 'medium' ? 'bg-[#B8860B]/5 border-[#B8860B]/15' :
                'bg-white border-[#E2DACB]'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    flag.severity === 'high' ? 'bg-[#C0392B]/10 text-[#C0392B]' :
                    flag.severity === 'medium' ? 'bg-[#B8860B]/10 text-[#B8860B]' :
                    'bg-[#F5F0E8] text-[#8C8577]'
                  }`}>{flag.severity}</span>
                  <span className="text-xs text-[#8C8577]">{flag.category}</span>
                </div>
                <p className="text-sm text-[#1A1714] font-medium mb-1">{flag.issue}</p>
                <p className="text-xs text-[#8C8577] mb-2 italic" style={{ fontFamily: 'Georgia, serif' }}>{flag.detail}</p>
                <p className="text-xs text-[#2D7A4F]">{flag.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Terms */}
      {analysis.keyTerms.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#1A1714] mb-3">Key Terms</h3>
          <div className="rounded-xl border border-[#E2DACB] overflow-hidden">
            {analysis.keyTerms.map((term, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-[#E2DACB]/60 last:border-0">
                <div>
                  <span className="text-xs text-[#8C8577]/60 uppercase tracking-wider">{term.category}</span>
                  <p className="text-sm text-[#8C8577]">{term.term}</p>
                </div>
                <span className="text-sm text-[#1A1714] font-medium">{term.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Obligations */}
      {analysis.deliveryObligations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#1A1714] mb-3">Delivery Obligations</h3>
          <div className="rounded-xl border border-[#E2DACB] overflow-hidden">
            {analysis.deliveryObligations.map((ob, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-[#E2DACB]/60 last:border-0">
                <span className="text-sm text-[#1A1714]">{ob.item}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  ob.priority === 'critical' ? 'bg-[#C0392B]/10 text-[#C0392B]' :
                  ob.priority === 'high' ? 'bg-[#B8860B]/10 text-[#B8860B]' :
                  ob.priority === 'medium' ? 'bg-[#B8860B]/5 text-[#B8860B]/70' :
                  'bg-[#F5F0E8] text-[#8C8577]'
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
            <h3 className="text-sm font-medium text-[#1A1714] mb-3">Territories</h3>
            <div className="flex flex-wrap gap-1.5">
              {analysis.territories.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-[#F5F0E8] border border-[#E2DACB] text-[#8C8577]">{t}</span>
              ))}
            </div>
          </div>
        )}
        {analysis.rights.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-[#1A1714] mb-3">Rights Granted</h3>
            <div className="flex flex-wrap gap-1.5">
              {analysis.rights.map((r) => (
                <span key={r} className="text-xs px-2.5 py-1 rounded-full bg-[#B8860B]/5 border border-[#B8860B]/15 text-[#B8860B]">{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Financial Terms */}
      {analysis.financialTerms.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#1A1714] mb-3">Financial Terms</h3>
          <div className="space-y-2">
            {analysis.financialTerms.map((ft, i) => (
              <div key={i} className="rounded-xl bg-white border border-[#E2DACB] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#8C8577] uppercase tracking-wider">{ft.type}</span>
                  {ft.amount && <span className="text-sm font-medium text-[#2D7A4F]">{ft.amount}</span>}
                  {ft.percentage && <span className="text-sm font-medium text-[#B8860B]">{ft.percentage}</span>}
                </div>
                <p className="text-xs text-[#8C8577]" style={{ fontFamily: 'Georgia, serif' }}>{ft.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
