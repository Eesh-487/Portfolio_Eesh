import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';

export function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const controls = [
    { key: 'Mouse Drag', action: 'Rotate camera around the scene' },
    { key: 'Mouse Wheel', action: 'Zoom in/out (2x to 50x)' },
    { key: 'Arrow Keys', action: 'Pan camera position' },
    { key: 'Space', action: 'Reset camera to origin' },
    { key: '+/-', action: 'Adjust field of view' },
    { key: 'Click Star', action: 'View project details' },
    { key: 'Search', action: 'Find and navigate to projects' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-sm text-white p-3 rounded-full border border-gray-700 hover:bg-gray-800/80 transition-colors z-40"
      >
        <HelpCircle size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-700 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Navigation Controls</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {controls.map((control, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-cyan-400 font-mono text-sm">
                      {control.key}
                    </span>
                    <span className="text-gray-300 text-sm text-right flex-1 ml-4">
                      {control.action}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-sm text-center">
                  Explore the cosmic portfolio by clicking on glowing stars to discover projects
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}