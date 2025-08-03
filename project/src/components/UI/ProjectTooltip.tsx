import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  title: string;
  description: string;
  category: string;
  isVisible: boolean;
  position: { x: number; y: number };
}

const categoryColors = {
  ai: '#06B6D4',
  quantum: '#8B5CF6',
  fullstack: '#14B8A6',
  personal: '#F59E0B',
};

export function ProjectTooltip({ title, description, category, isVisible, position }: TooltipProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed pointer-events-none z-50"
          style={{
            left: position.x + 20,
            top: position.y - 10,
          }}
        >
          <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 max-w-xs shadow-xl">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: categoryColors[category as keyof typeof categoryColors] }}
              />
              <h3 className="text-white font-semibold text-sm">{title}</h3>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              {description.length > 100 ? `${description.substring(0, 100)}...` : description}
            </p>
            <p className="text-gray-500 text-xs mt-1">Click to explore</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
