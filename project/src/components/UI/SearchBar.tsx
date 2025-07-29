import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { projects } from '../../data/projects';

export function SearchBar() {
  const { searchTerm, setSearchTerm, setCameraTarget } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof projects>([]);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = projects.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies?.some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSuggestionClick = (project: typeof projects[0]) => {
    setCameraTarget(project.position);
    setSearchTerm('');
    setIsExpanded(false);
  };

  return (
    <div className="relative">
      <motion.div
        className="flex items-center bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-700"
        animate={{
          width: isExpanded ? 300 : 48,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 text-gray-400 hover:text-white transition-colors"
        >
          <Search size={20} />
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex items-center"
            >
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white placeholder-gray-400 outline-none flex-1 px-2"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-1 text-gray-400 hover:text-white transition-colors mr-2"
                >
                  <X size={16} />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Search suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden z-50"
          >
            {suggestions.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSuggestionClick(project)}
                className="w-full text-left p-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800 last:border-b-0"
              >
                <div className="text-white font-medium">{project.title}</div>
                <div className="text-gray-400 text-sm">{project.category}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}