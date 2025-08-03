import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function FloatingInfo() {
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(false);
    }, 8000); // Show tip for 8 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showTip && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none"
        >
          <div className="bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-blue-500 flex items-center gap-2 shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">
              Hover over stars to see project details, click to explore!
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
