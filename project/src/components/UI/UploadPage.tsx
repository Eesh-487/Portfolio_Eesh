import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, UploadCloud } from 'lucide-react';

type ResumeMetadata = {
  downloadUrl?: string;
  sourceUrl?: string;
};

type UploadPageProps = {
  onBack: () => void;
};

export function UploadPage({ onBack }: UploadPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('/resume.pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const response = await fetch('/api/resume');
        if (!response.ok) {
          throw new Error('Resume API unavailable');
        }

        const resumeData = (await response.json()) as ResumeMetadata;
        setPreviewUrl(`${resumeData.downloadUrl || '/resume.pdf'}?ts=${Date.now()}`);
      } catch {
        setPreviewUrl('/resume.pdf');
      }
    };

    void loadResume();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setErrorMessage(null);
    setMessage(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      setSelectedFile(null);
      setErrorMessage('Please choose a PDF file.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl((currentUrl) => {
      if (currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Select a PDF before uploading.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await fetch('/api/resume', {
        method: 'POST',
        headers: {
          'Content-Type': selectedFile.type || 'application/pdf',
          'X-Filename': selectedFile.name,
        },
        body: selectedFile,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || `Upload failed (${response.status})`);
      }

      const resumeData = (await response.json()) as ResumeMetadata;
      setPreviewUrl(`${resumeData.downloadUrl || '/resume.pdf'}?ts=${Date.now()}`);
      setSelectedFile(null);
      setMessage('Resume uploaded and published.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2 text-sm font-medium text-gray-200 backdrop-blur-sm transition-colors hover:border-cyan-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to portfolio
          </button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">Resume Upload</p>
            <h1 className="mt-1 text-lg font-semibold sm:text-2xl">Replace the current resume PDF</h1>
          </div>
        </div>

        <div className="grid flex-1 gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-3xl border border-gray-700 bg-gray-900/75 p-5 shadow-2xl backdrop-blur-md"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-400">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Upload a PDF</h2>
                <p className="text-sm text-gray-400">Only one resume is kept. New uploads replace the old file.</p>
              </div>
            </div>

            <label className="grid gap-2 text-sm text-gray-300">
              Choose PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full rounded-xl border border-gray-700 bg-gray-950/60 px-3 py-2 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-700"
              />
            </label>

            {selectedFile && (
              <p className="mt-3 break-all text-sm text-gray-400">Selected file: {selectedFile.name}</p>
            )}

            {message && <p className="mt-3 text-sm text-emerald-400">{message}</p>}
            {errorMessage && <p className="mt-3 text-sm text-red-400">{errorMessage}</p>}

            <button
              onClick={() => void handleUpload()}
              disabled={!selectedFile || isUploading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UploadCloud className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Publish new resume'}
            </button>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="overflow-hidden rounded-3xl border border-gray-700 bg-gray-950/75 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-700 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FileText className="h-4 w-4" />
                Current resume preview
              </div>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-cyan-400 transition-colors hover:text-cyan-300"
              >
                Open in new tab
              </a>
            </div>

            <iframe
              key={previewUrl}
              src={previewUrl}
              title="Resume preview"
              className="h-[calc(100vh-170px)] w-full bg-white"
            />
          </motion.section>
        </div>
      </div>
    </div>
  );
}