import React from 'react';
import { FileText } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { projects } from '../../data/projects';

// Who this is and where to go first, within the first few seconds
export function IdentityPanel() {
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const exploreProjects = () => {
    const hub = projects.find((p) => p.id === 'projects');
    if (hub) setSelectedProject(hub);
  };

  return (
    <div className="glass rounded-3xl px-5 py-4 text-center">
      <h1 className="text-[20px] font-semibold tracking-tight text-white leading-tight">Eesh Khanna</h1>
      <p className="mt-0.5 text-[13px] font-medium text-[#ffc677]">AI Engineer · Machine Learning · Agentic Systems</p>
      <p className="mt-1.5 text-[13px] text-white/60">Building intelligent systems that solve real-world problems.</p>
      <div className="mt-3 flex justify-center gap-2">
        <button onClick={exploreProjects} className="btn-prominent min-h-[36px] px-4 text-[13px]">
          Explore Projects
        </button>
        <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="btn-glass min-h-[36px] px-4 text-[13px]">
          <FileText size={14} />
          View Resume
        </a>
      </div>
    </div>
  );
}
