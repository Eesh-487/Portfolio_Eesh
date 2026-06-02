import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Github } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

const categoryColors = {
  ai: "#06B6D4",
  quantum: "#8B5CF6",
  fullstack: "#14B8A6",
  personal: "#F59E0B",
};

export function ProjectModal() {
  const { selectedProject, setSelectedProject } = useAppStore();
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string>('/resume.pdf');

  useEffect(() => {
    if (selectedProject?.id === 'resume') {
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
      setResumePreviewUrl('/resume.pdf');
    }
  }, [selectedProject?.id]);

  useEffect(() => {
    return () => {
      if (resumePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

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

            {/* Resume PDF */}
            {selectedProject.id === "resume" && (
              <div className="mb-6 space-y-4">
                <a
                  href={resumePreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700"
                >
                  View PDF
                </a>
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
