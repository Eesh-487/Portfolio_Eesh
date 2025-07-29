export interface Project {
  id: string;
  title: string;
  category: 'ai' | 'quantum' | 'fullstack' | 'personal';
  position: [number, number, number];
  description: string;
  technologies?: string[];
  demoUrl?: string;
  githubUrl?: string;
  size: 'small' | 'medium' | 'large';
  connections?: string[];
  email?: string;
}

export interface AppState {
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilters: string[];
  setActiveFilters: (filters: string[]) => void;
  cameraTarget: [number, number, number] | null;
  setCameraTarget: (target: [number, number, number] | null) => void;
}