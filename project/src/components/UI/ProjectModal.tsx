import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github, FileText } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const categoryColors = {
  ai: '#06B6D4',
  quantum: '#8B5CF6',
  fullstack: '#14B8A6',
  personal: '#F59E0B',
};

export function ProjectModal() {
  const { selectedProject, setSelectedProject } = useAppStore();

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
            transition={{ type: 'spring', duration: 0.5 }}
            className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-700 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: categoryColors[selectedProject.category] }}
                />
                <h2 className="text-xl font-bold text-white">{selectedProject.title}</h2>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {selectedProject.description && (
              <p className="text-gray-200 mb-6 leading-relaxed text-base font-medium">
                {selectedProject.description}
              </p>
            )}

            {/* Resume PDF Button */}
            {selectedProject.id === 'resume' && (
              <div className="mb-6 flex justify-center">
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-lg font-bold transition-colors"
                >
                  <FileText size={18} />
                  Open Resume PDF
                </a>
              </div>
            )}

            {/* Contact Card */}
            {selectedProject.id === 'contact' && (
              <div className="mb-6 flex flex-col items-center">
                {selectedProject.email && (
                  <>
                    <span className="text-lg font-semibold text-white mb-2">Email</span>
                    <a
                      href={`mailto:${selectedProject.email}`}
                      className="text-cyan-400 underline text-base mb-4"
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
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-colors mt-2"
                  >
                    <Github size={18} />
                    GitHub
                  </a>
                )}
              </div>
            )}

            {/* Other Cards */}
            {selectedProject.id !== 'resume' && selectedProject.id !== 'contact' && (
              <>
                {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-3">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech) => (
                        <span key={tech} className="bg-gray-800 text-cyan-100 px-3 py-1.5 rounded-full text-sm font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {selectedProject.demoUrl && (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
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