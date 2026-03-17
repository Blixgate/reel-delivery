'use client';

import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function FileUpload({
  onFileUpload,
  isLoading,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
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
    const file = files[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'text/plain',
    ];

    const validExtensions = ['.docx', '.pdf', '.txt'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!hasValidExtension && !validTypes.includes(file.type)) {
      alert('Please upload a .docx, .pdf, or .txt file');
      return;
    }

    await onFileUpload(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-[#B8860B]/40 bg-[#B8860B]/5'
            : 'border-[#E2DACB] hover:border-[#B8860B]/40'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.pdf,.txt"
          onChange={handleFileInputChange}
          disabled={isLoading}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          {isLoading ? (
            <>
              <div className="w-8 h-8 border-2 border-[#B8860B]/30 border-t-[#B8860B] rounded-full animate-spin" />
              <p className="text-[#8C8577]" style={{ fontFamily: 'Georgia, serif' }}>Parsing your file...</p>
            </>
          ) : (
            <>
              <svg
                className="w-12 h-12 text-[#E2DACB]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6"
                />
              </svg>
              <div>
                <p className="text-lg font-semibold text-[#1A1714]">
                  Drop your delivery schedule here
                </p>
                <p className="text-sm text-[#8C8577] mt-1" style={{ fontFamily: 'Georgia, serif' }}>
                  or click to browse (.docx, .pdf, .txt)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-[#C0392B]/5 border border-[#C0392B]/15 rounded-xl">
          <p className="text-[#C0392B] text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
