import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, User, FolderOpen, Download, Mail, HelpCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { projects } from '../../data/projects';

interface NavigationOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

export function WelcomeModal() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { setCameraTarget, setSelectedProject } = useAppStore();

  useEffect(() => {
    const visited = localStorage.getItem('portfolio-visited');
    if (!visited) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, []);

  const navigationOptions: NavigationOption[] = [
    {
      id: 'about-me',
      title: 'About Me',
      description: 'Learn about my background, skills, and passion for technology',
      icon: <User className="w-6 h-6" />,
      category: 'personal'
    },
    {
      id: 'projects',
      title: 'Projects Hub',
      description: 'Explore my featured work in AI, Full-Stack, and innovative solutions',
      icon: <FolderOpen className="w-6 h-6" />,
      category: 'showcase'
    },
    {
      id: 'disaster-reporting-tool',
      title: 'Disaster Reporting Tool',
      description: 'Real-time disaster reporting platform with AI and visualization',
      icon: <Rocket className="w-6 h-6" />,
      category: 'ai'
    },
    {
      id: 'resume',
      title: 'Resume',
      description: 'Download my professional resume and timeline',
      icon: <Download className="w-6 h-6" />,
      category: 'personal'
    },
    {
      id: 'contact',
      title: 'Contact',
      description: 'Get in touch via email or social links',
      icon: <Mail className="w-6 h-6" />,
      category: 'personal'
    }
  ];

  const handleNavigate = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCameraTarget(project.position);
      setSelectedProject(project);
    }
    setShowWelcome(false);
    localStorage.setItem('portfolio-visited', 'true');
  };

  const handleClose = () => {
    setShowWelcome(false);
    localStorage.setItem('portfolio-visited', 'true');
  };

  const categoryColors = {
    personal: '#F59E0B',
    showcase: '#14B8A6',
    ai: '#06B6D4',
    fullstack: '#14B8A6',
  };

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="bg-gray-900/95 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  Welcome to My Interactive Portfolio
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-400 text-lg"
                >
                  Navigate through my cosmic constellation of projects and experiences
                </motion.p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Instructions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-400">How to Navigate</h3>
              </div>
              <p className="text-gray-300 text-sm">
                This is a 3D interactive portfolio. Click on any project below to fly to it in the cosmic space. 
                Use your mouse to orbit around, and click on stars to learn more about each project.
              </p>
            </motion.div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {navigationOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => handleNavigate(option.id)}
                  className="group p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-gray-600 rounded-lg transition-all duration-300 text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${categoryColors[option.category as keyof typeof categoryColors]}20` }}
                    >
                      <div style={{ color: categoryColors[option.category as keyof typeof categoryColors] }}>
                        {option.icon}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                        {option.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-between items-center pt-6 border-t border-gray-700"
            >
              <p className="text-gray-500 text-sm">
                You can always return to this menu by pressing the help button (?)
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Start Exploring
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
