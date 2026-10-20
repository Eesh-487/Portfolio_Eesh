import { create } from 'zustand';
import { AppState } from '../types/project';

export const useAppStore = create<AppState & {
  hoveredProjectId: string | null;
  setHoveredProjectId: (id: string | null) => void;
  motionPaused: boolean;
  toggleMotion: () => void;
}>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  activeFilters: ['ai', 'quantum', 'fullstack', 'personal'],
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  hoveredProjectId: null,
  setHoveredProjectId: (id) => set({ hoveredProjectId: id }),
  motionPaused: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  toggleMotion: () => set((s) => ({ motionPaused: !s.motionPaused })),
}));