"use client";

import { useState, useRef } from "react";

interface DocumentUploadProps {
  documentText: string;
  documentName: string;
  onDocumentChange: (text: string, name: string) => void;
}

export default function DocumentUpload({
  documentText,
  documentName,
  onDocumentChange,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-text", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extract text");
      }

      const data = await res.json();
      onDocumentChange(data.text, data.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Upload a Business Document
        </h3>
        <p className="text-sm text-gray-400">
          Upload a PDF, DOCX, or TXT file about a business, product, or
          industry. The AI will generate a realistic prospect persona based on
          the content.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-green-500 bg-green-500/10"
            : "border-gray-700 hover:border-gray-600 bg-gray-900/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Extracting text...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg
              className="w-10 h-10 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
            <div>
              <p className="text-sm text-gray-300">
                Drop a file here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOCX, or TXT (max 15K characters extracted)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Or paste text */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Or paste text directly
        </label>
        <textarea
          value={documentText}
          onChange={(e) => onDocumentChange(e.target.value, "Pasted text")}
          placeholder="Paste business description, product info, company details..."
          rows={6}
          className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
        />
      </div>

      {/* Status */}
      {documentName && documentText && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
          <svg
            className="w-5 h-5 text-green-500 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="min-w-0">
            <p className="text-sm text-green-400 font-medium truncate">
              {documentName}
            </p>
            <p className="text-xs text-gray-400">
              {documentText.length.toLocaleString()} characters extracted
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
