import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Github, FileText, Upload } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

const categoryColors = {
  ai: "#06B6D4",
  quantum: "#8B5CF6",
  fullstack: "#14B8A6",
  personal: "#F59E0B",
};

export function ProjectModal() {
  const { selectedProject, setSelectedProject } = useAppStore();
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string>('/resume.pdf');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploadMessage, setResumeUploadMessage] = useState<string | null>(null);
  const [resumeUploadError, setResumeUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject?.id === 'resume') {
      setSelectedResumeFile(null);
      setResumeUploadMessage(null);
      setResumeUploadError(null);

      const loadCurrentResume = async () => {
        try {
          const response = await fetch('/api/resume', { method: 'GET' });
          if (!response.ok) {
            throw new Error('Resume API unavailable');
          }

          const resumeData = await response.json();
          setResumePreviewUrl(`${resumeData.downloadUrl || '/resume.pdf'}?ts=${Date.now()}`);
        } catch {
          setResumePreviewUrl('/resume.pdf');
        }
      };

      void loadCurrentResume();
    } else {
      setSelectedResumeFile(null);
      setResumePreviewUrl('/resume.pdf');
      setResumeUploadMessage(null);
      setResumeUploadError(null);
    }
  }, [selectedProject?.id]);

  useEffect(() => {
    return () => {
      if (resumePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setResumeUploadError(null);
    setResumeUploadMessage(null);

    if (!file) {
      setSelectedResumeFile(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      setSelectedResumeFile(null);
      setResumeUploadError('Please choose a PDF file.');
      return;
    }

    setSelectedResumeFile(file);
    setResumePreviewUrl((currentUrl) => {
      if (currentUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentUrl);
      }
      return URL.createObjectURL(file);
    });
  };

  const handleResumeUpload = async () => {
    if (!selectedResumeFile) {
      setResumeUploadError('Select a PDF before uploading.');
      return;
    }

    setIsUploadingResume(true);
    setResumeUploadError(null);
    setResumeUploadMessage(null);

    try {
      const response = await fetch('/api/resume', {
        method: 'POST',
        headers: {
          'Content-Type': selectedResumeFile.type || 'application/pdf',
          'X-Filename': selectedResumeFile.name,
        },
        body: selectedResumeFile,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || `Upload failed (${response.status})`);
      }

      const resumeData = await response.json();
      setResumePreviewUrl(`${resumeData.downloadUrl || '/resume.pdf'}?ts=${Date.now()}`);
      setSelectedResumeFile(null);
      setResumeUploadMessage('Resume uploaded and published.');
    } catch (error) {
      setResumeUploadError(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setIsUploadingResume(false);
    }
  };

  return (
    <AnimatePresence>
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1000] p-4"
          onClick={() => setSelectedProject(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-700 p-4 sm:p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: categoryColors[selectedProject.category],
                  }}
                />
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide font-orbitron">
                  {selectedProject.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-white transition-colors p-1 -mr-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Description */}
            {selectedProject.description && (
              <p className="text-white mb-6 leading-loose text-sm sm:text-base font-normal tracking-widest font-quicksand max-w-prose mx-auto whitespace-pre-line">
                {selectedProject.description}
              </p>
            )}

            {/* Resume PDF Button */}
            {selectedProject.id === "resume" && (
              <div className="mb-6 space-y-4">
                <div className="rounded-xl border border-gray-700 bg-gray-950/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <label className="flex-1 grid gap-2 text-left">
                      <span className="text-sm font-semibold text-white tracking-wide">Upload a new PDF</span>
                      <input
                        key={selectedProject.id}
                        type="file"
                        accept="application/pdf"
                        onChange={handleResumeFileChange}
                        className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-cyan-700"
                      />
                    </label>
                    <button
                      onClick={() => void handleResumeUpload()}
                      disabled={!selectedResumeFile || isUploadingResume}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Upload size={16} />
                      {isUploadingResume ? 'Uploading...' : 'Publish PDF'}
                    </button>
                  </div>
                  {selectedResumeFile && (
                    <p className="mt-3 text-xs sm:text-sm text-gray-400 break-all">
                      Selected file: {selectedResumeFile.name}
                    </p>
                  )}
                  {resumeUploadMessage && (
                    <p className="mt-3 text-sm text-emerald-400">{resumeUploadMessage}</p>
                  )}
                  {resumeUploadError && (
                    <p className="mt-3 text-sm text-red-400">{resumeUploadError}</p>
                  )}
                </div>

                <div className="rounded-xl border border-gray-700 bg-black/30 overflow-hidden">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-700 px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <FileText size={16} />
                      Current resume preview
                    </div>
                    <a
                      href={resumePreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Open in new tab
                    </a>
                  </div>
                  <iframe
                    key={resumePreviewUrl}
                    src={resumePreviewUrl}
                    title="Current resume PDF preview"
                    className="h-[50vh] w-full bg-white"
                  />
                </div>
              </div>
            )}

            {/* Contact Card */}
            {selectedProject.id === "contact" && (
              <div className="mb-6 flex flex-col items-center">
                {selectedProject.email && (
                  <>
                    <span className="text-base sm:text-lg font-semibold text-white mb-2">
                      Email
                    </span>
                    <a
                      href={`mailto:${selectedProject.email}`}
                      className="text-cyan-400 underline text-sm sm:text-base mb-4 break-all text-center tracking-wide"
                    >
                      {selectedProject.email}
                    </a>
                  </>
                )}
                {selectedProject.githubUrl && (
                  <a
                    href={selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg font-bold transition-colors mt-2 text-sm sm:text-base"
                  >
                    <Github size={18} />
                    GitHub
                  </a>
                )}
              </div>
            )}

            {/* Technologies & Links */}
            {selectedProject.id !== "resume" &&
              selectedProject.id !== "contact" && (
                <>
                  {selectedProject.technologies &&
                    selectedProject.technologies.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-white font-semibold mb-3 text-sm sm:text-base tracking-wide font-orbitron">
                          Technologies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="bg-indigo-700 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-wider shadow-sm font-quicksand"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  <div className="flex flex-wrap gap-3">
                    {selectedProject.demoUrl && (
                      <a
                        href={selectedProject.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base font-medium tracking-wide"
                      >
                        <ExternalLink size={16} />
                        Live Demo
                      </a>
                    )}
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base font-medium tracking-wide"
                      >
                        <Github size={16} />
                        Source Code
                      </a>
                    )}
                  </div>
                </>
              )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
