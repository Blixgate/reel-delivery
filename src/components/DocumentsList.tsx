'use client';

import React, { useRef, useState } from 'react';
import { UploadedDocument, DocumentType } from '@/lib/types';

interface DocumentsListProps {
  documents: UploadedDocument[];
  onDocumentsChange: (documents: UploadedDocument[]) => void;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  delivery_schedule: 'Delivery Schedule',
  cast_agreement: 'Cast Agreement',
  crew_agreement: 'Crew Agreement',
  vendor_agreement: 'Vendor Agreement',
  music_license: 'Music License',
  sync_license: 'Sync License',
  master_use_license: 'Master Use License',
  composer_agreement: 'Composer Agreement',
  chain_of_title: 'Chain of Title',
  copyright_registration: 'Copyright Registration',
  eo_insurance: 'E&O Insurance',
  lab_access_letter: 'Lab Access Letter',
  qc_report: 'QC Report',
  sales_agreement: 'Sales Agreement',
  sales_estimates: 'Sales Estimates',
  finance_plan: 'Finance Plan',
  script: 'Script',
  ccsl: 'Closed Captions (CCSL)',
  music_cue_sheet: 'Music Cue Sheet',
  rating_certificate: 'Rating Certificate',
  certificate_of_origin: 'Certificate of Origin',
  tax_credit_certificate: 'Tax Credit Certificate',
  other: 'Other',
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default function DocumentsList({
  documents,
  onDocumentsChange,
}: DocumentsListProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => handleFileUpload(file));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => handleFileUpload(file));
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/classify-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to classify document');
      }

      const data = await response.json();

      const newDoc: UploadedDocument = {
        id: Math.random().toString(36).substring(7),
        filename: file.name,
        fileType: file.type,
        documentType: data.documentType,
        uploadedAt: new Date().toISOString(),
        extractedData: data.extractedData,
        fulfills: data.matchedDeliveryItems || [],
        fileSize: file.size,
      };

      onDocumentsChange([...documents, newDoc]);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to upload document'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#2E5D8A] bg-blue-50'
            : 'border-gray-300 hover:border-[#2E5D8A]'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.pdf,.txt"
          onChange={handleFileInputChange}
          disabled={isLoading}
          className="hidden"
          multiple
        />

        <div className="flex flex-col items-center gap-3">
          {isLoading ? (
            <>
              <div className="animate-spin">
                <svg
                  className="w-8 h-8 text-[#1B3A5C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Classifying documents...</p>
            </>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-[#1B3A5C]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div>
                <p className="text-lg font-semibold text-[#1B3A5C]">
                  Drop documents here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse (contracts, agreements, certificates)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      {documents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">
              Documents ({documents.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {documents.map((doc) => (
              <div key={doc.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 break-words">
                      {doc.filename}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block px-3 py-1 bg-[#1B3A5C] text-white text-xs font-medium rounded-full">
                        {DOCUMENT_TYPE_LABELS[doc.documentType]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onDocumentsChange(
                        documents.filter((d) => d.id !== doc.id)
                      );
                    }}
                    className="text-red-600 hover:text-red-800 transition-colors"
                    title="Remove document"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                {doc.fulfills && doc.fulfills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
                      Fulfills Delivery Items
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {doc.fulfills.map((itemId) => (
                        <span
                          key={itemId}
                          className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded"
                        >
                          Item ID: {itemId.substring(0, 8)}...
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {doc.fulfills && doc.fulfills.length === 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500">
                      No delivery items matched for this document
                    </p>
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-400">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <p className="text-gray-500">
            No documents uploaded yet. Upload contracts, agreements, and
            certifications to track your delivery requirements.
          </p>
        </div>
      )}
    </div>
  );
}
