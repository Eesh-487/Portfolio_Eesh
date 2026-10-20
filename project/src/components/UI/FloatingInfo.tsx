import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function FloatingInfo() {
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTip(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showTip && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-x-0 bottom-24 z-30 pointer-events-none flex justify-center px-4"
        >
          <div className="glass text-white px-4 py-2.5 rounded-full flex items-center gap-2" role="status">
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
            <span className="text-[13px] sm:text-[15px] font-medium">
              {window.matchMedia('(pointer: coarse)').matches
                ? 'Drag to explore. Tap a neuron to open it.'
                : 'Drag to explore, scroll to zoom. Click a neuron to open it.'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
