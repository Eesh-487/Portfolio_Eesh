import React from 'react';
import { FileText, Mail, Github, Linkedin } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { projects } from '../../data/projects';

const contact = projects.find((p) => p.id === 'contact');

// Resume and contact stay one tap away, without needing to read the network
export function UtilityBar() {
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const item = 'glass-press inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium text-white/85 hover:text-white hover:bg-white/10';

  return (
    <nav aria-label="Quick links" className="glass flex items-center gap-0.5 rounded-full p-1">
      <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className={item}>
        <FileText size={16} /> Resume
      </a>
      <button onClick={() => contact && setSelectedProject(contact)} className={item}>
        <Mail size={16} /> Contact
      </button>
      {contact?.githubUrl && (
        <a href={contact.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={item}>
          <Github size={16} />
        </a>
      )}
      {contact?.linkedinUrl && (
        <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={item}>
          <Linkedin size={16} />
        </a>
      )}
    </nav>
  );
}
