import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { projects } from '../../data/projects';

function getProjectById(id: string) {
  return projects.find(p => p.id === id);
}

function getChildren(id: string) {
  const node = getProjectById(id);
  if (!node || !node.connections) return [];
  return node.connections
    .map(getProjectById)
    .filter((child): child is typeof projects[0] => !!child);
}

function ProjectDropdown({ project }: { project: typeof projects[0] }) {
  const [open, setOpen] = useState(false);
  const setCameraTarget = useAppStore(s => s.setCameraTarget);
  const setSelectedProject = useAppStore(s => s.setSelectedProject);

  // Only show actual projects (not about/resume/contact)
  const children = getChildren(project.id).filter(
    c => !['about-me', 'resume', 'contact'].includes(c.id)
  );

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center w-full text-left px-3 py-2 rounded font-bold text-white hover:bg-gray-800 transition-colors"
      >
        <span className="mr-2">{open ? '▼' : '▶'}</span>
        {project.title}
      </button>
      {open && (
        <div className="ml-2 border-l border-gray-700 pl-2">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => {
                setCameraTarget(child.position);
                setSelectedProject(child);
              }}
              className="block w-full text-left px-3 py-2 rounded text-gray-300 hover:bg-gray-800 transition-colors"
              style={{ paddingLeft: 32 }}
            >
              {child.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function NavigatorPanel() {
  const [open, setOpen] = useState(false);

  const aboutMe = getProjectById('about-me');
  const resume = getProjectById('resume');
  const contact = getProjectById('contact');
  const projectsNode = getProjectById('projects');

  if (!aboutMe || !resume || !contact || !projectsNode) return null;

  const setCameraTarget = useAppStore(s => s.setCameraTarget);
  const setSelectedProject = useAppStore(s => s.setSelectedProject);

  return (
    <div className="w-64">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center w-20 px-4 py-2 mb-2 bg-gray-800 text-cyan-400 font-bold rounded-lg shadow hover:bg-gray-700 transition-colors"
      >
        {/* Symbol/Icon for Navigator */}
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="ml-auto">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700 rounded-xl shadow-lg p-4 max-h-[80vh] overflow-y-auto">
          <button
            onClick={() => {
              setCameraTarget(aboutMe.position);
              setSelectedProject(aboutMe);
            }}
            className="block w-full text-left px-3 py-2 rounded font-bold text-white hover:bg-gray-800 transition-colors mb-1"
          >
            About Me
          </button>
          <button
            onClick={() => {
              setCameraTarget(resume.position);
              setSelectedProject(resume);
            }}
            className="block w-full text-left px-3 py-2 rounded font-bold text-white hover:bg-gray-800 transition-colors mb-1"
          >
            Resume
          </button>
          <button
            onClick={() => {
              setCameraTarget(contact.position);
              setSelectedProject(contact);
            }}
            className="block w-full text-left px-3 py-2 rounded font-bold text-white hover:bg-gray-800 transition-colors mb-2"
          >
            Contact Me
          </button>
          <ProjectDropdown project={projectsNode} />
        </div>
      )}
    </div>
  );
}