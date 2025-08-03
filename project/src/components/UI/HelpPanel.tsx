import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Mouse, Navigation, Eye, Star, Rocket, Home } from 'lucide-react';

export function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const controls = [
    { 
      key: 'Mouse Drag', 
      action: 'Rotate camera around the scene',
      icon: <Mouse className="w-4 h-4" />
    },
    { 
      key: 'Mouse Wheel', 
      action: 'Zoom in/out (2x to 50x)',
      icon: <Eye className="w-4 h-4" />
    },
    { 
      key: 'Arrow Keys', 
      action: 'Pan camera position',
      icon: <Navigation className="w-4 h-4" />
    },
    { 
      key: 'Space', 
      action: 'Reset camera to origin',
      icon: <Home className="w-4 h-4" />
    },
    { 
      key: 'Click Star', 
      action: 'View project details',
      icon: <Star className="w-4 h-4" />
    },
    { 
      key: 'Search', 
      action: 'Find and navigate to projects',
      icon: <Rocket className="w-4 h-4" />
    },
  ];

  const showWelcomeModal = () => {
    localStorage.removeItem('portfolio-visited');
    window.location.reload();
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600/90 backdrop-blur-sm text-white p-3 rounded-full border border-blue-500 hover:bg-blue-700/90 transition-colors z-40 shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <HelpCircle size={20} />
      </motion.button>

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
                <h2 className="text-xl font-bold text-white">Navigation Help</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {controls.map((control, index) => (
                  <motion.div
                    key={control.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="text-blue-400">
                      {control.icon}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{control.key}</div>
                      <div className="text-gray-400 text-xs">{control.action}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4">
                <button
                  onClick={showWelcomeModal}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Show Welcome Guide
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}