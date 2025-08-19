import { create } from 'zustand';
import { AppState } from '../types/project';

export const useAppStore = create<AppState & {
  centerNodeId: string;
  setCenterNodeId: (id: string) => void;
  hoveredProjectId: string | null;
  setHoveredProjectId: (id: string | null) => void;
}>((set) => ({
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
  activeFilters: ['ai', 'quantum', 'fullstack', 'personal'],
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  cameraTarget: null,
  setCameraTarget: (target) => set({ cameraTarget: target }),
  centerNodeId: 'about-me',
  setCenterNodeId: (id) => set({ centerNodeId: id }),
  hoveredProjectId: null,
  setHoveredProjectId: (id) => set({ hoveredProjectId: id }),
}));