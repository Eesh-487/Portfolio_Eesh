import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { projects } from '../../data/projects';

export function ProjectIntroduction() {
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const { setCameraTarget } = useAppStore();

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('portfolio-intro-seen');
    if (!hasSeenIntro) {
      setShowIntro(true);
      animateProjectIntros();
    }
  }, []);

  const animateProjectIntros = () => {
    let index = 0;
    const mainProjects = projects.filter(p => 
      ['about-me', 'projects', 'disaster-reporting-tool', 'resume', 'contact'].includes(p.id)
    );

    const showNextProject = () => {
      if (index < mainProjects.length) {
        setCurrentProjectIndex(index);
        setCameraTarget(mainProjects[index].position);
        index++;
        setTimeout(showNextProject, 2000); // Show each project for 2 seconds
      } else {
        setTimeout(() => {
          setShowIntro(false);
          localStorage.setItem('portfolio-intro-seen', 'true');
          // Return to center view
          setCameraTarget([0, 0, 20]);
        }, 1000);
      }
    };

    setTimeout(showNextProject, 1000);
  };

  const mainProjects = projects.filter(p => 
    ['about-me', 'projects', 'disaster-reporting-tool', 'resume', 'contact'].includes(p.id)
  );

  const skipIntro = () => {
    setShowIntro(false);
    localStorage.setItem('portfolio-intro-seen', 'true');
    setCameraTarget([0, 0, 20]);
  };

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40"
        >
          <div className="text-center max-w-2xl mx-auto p-8">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Welcome to Eesh Khanna's Portfolio
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-gray-300 mb-8"
            >
              Transforming Ideas into Intelligent Solutions
            </motion.p>

            {currentProjectIndex < mainProjects.length && (
              <motion.div
                key={currentProjectIndex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 mb-8"
              >
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {mainProjects[currentProjectIndex]?.title}
                </h3>
                <p className="text-gray-400">
                  {mainProjects[currentProjectIndex]?.description}
                </p>
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={skipIntro}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Skip Introduction
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
