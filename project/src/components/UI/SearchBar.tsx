import React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { projects, matchesSearch } from '../../data/projects';

export function SearchBar() {
  const { searchTerm, setSearchTerm, setSelectedProject } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof projects>([]);

  useEffect(() => {
    if (searchTerm.length > 1) {
      setSuggestions(projects.filter(project => matchesSearch(project, searchTerm)));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const handleSuggestionClick = (project: typeof projects[0]) => {
    setSelectedProject(project);
    setSearchTerm('');
    setIsExpanded(false);
  };

  return (
    <div className="relative">
      <motion.div
        className="glass flex items-center rounded-full h-11 overflow-hidden"
        animate={{ width: isExpanded ? '100%' : 44 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Close search' : 'Search projects'}
          aria-expanded={isExpanded}
          className="icon-btn"
        >
          <Search size={18} />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center min-w-0"
            >
              <input
                type="search"
                placeholder="Search projects"
                aria-label="Search projects"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setIsExpanded(false)}
                className="bg-transparent text-white text-[15px] placeholder-white/50 outline-none flex-1 min-w-0 pr-2 [&::-webkit-search-cancel-button]:hidden"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="icon-btn"
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
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass absolute top-full mt-2 w-full rounded-2xl p-1.5 z-50 max-h-[50vh] overflow-y-auto"
            role="listbox"
          >
            {suggestions.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSuggestionClick(project)}
                className="glass-row flex-col items-start justify-center gap-0 py-2"
                role="option"
              >
                <div className="text-white font-medium text-[15px]">{project.title}</div>
                <div className="text-white/55 text-[13px] capitalize">{project.category}</div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
