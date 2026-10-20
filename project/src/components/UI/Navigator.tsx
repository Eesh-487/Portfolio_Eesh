import React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Compass } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { projects } from '../../data/projects';
import { HUB_IDS, SECTIONS, network, sectionOf } from '../Scene/networkLayout';

function getProjectById(id: string) {
  return projects.find(p => p.id === id);
}

function Dot({ color, active }: { color: string; active: boolean }) {
  return (
    <span
      className="w-2 h-2 rounded-full shrink-0 transition-shadow"
      style={{ backgroundColor: color, boxShadow: active ? `0 0 10px ${color}` : 'none' }}
    />
  );
}

function SectionGroup({ hubId }: { hubId: string }) {
  const [open, setOpen] = useState(false);
  const selected = useAppStore(s => s.selectedProject);
  const setSelectedProject = useAppStore(s => s.setSelectedProject);
  const hub = getProjectById(hubId);
  const { label, color } = SECTIONS[sectionOf(hubId)];
  const children = (network.children.get(hubId) ?? []).map(getProjectById).filter((c): c is NonNullable<typeof c> => !!c);
  // Navigation and network light up together
  const active = !!selected && sectionOf(selected.id) === hubId;

  if (!hub) return null;
  return (
    <div>
      <div className={`flex items-center rounded-xl transition-colors ${active ? 'bg-white/[0.08]' : ''}`}>
        <button onClick={() => setSelectedProject(hub)} className="glass-row flex-1 font-medium" aria-current={selected?.id === hubId}>
          <Dot color={color} active={active} />
          {label}
          <span className="ml-auto text-[12px] text-white/40">{children.length}</span>
        </button>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={`${open ? 'Hide' : 'Show'} ${label} items`}
          className="icon-btn w-10 h-11 rounded-xl"
        >
          <ChevronRight size={16} className={`text-white/50 transition-transform ${open ? 'rotate-90' : ''}`} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden ml-[18px] border-l pl-2"
            style={{ borderColor: `${color}40` }}
          >
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedProject(child)}
                aria-current={selected?.id === child.id}
                className={`glass-row ${selected?.id === child.id ? 'bg-white/10 text-white' : 'text-white/75'}`}
              >
                {child.title}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NavigatorPanel() {
  const [open, setOpen] = useState(false);
  const selected = useAppStore(s => s.selectedProject);
  const setSelectedProject = useAppStore(s => s.setSelectedProject);
  const aboutMe = getProjectById('about-me');
  if (!aboutMe) return null;
  const aboutActive = selected?.id === 'about-me';

  return (
    <motion.div layout className={`glass rounded-3xl overflow-hidden ${open ? 'w-full' : 'w-auto self-start'}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center gap-3 w-full min-h-[44px] px-4 text-[15px] font-semibold text-white"
      >
        <Compass size={18} className="text-cyan-300" />
        Navigate
        <ChevronDown size={16} className={`ml-auto text-white/60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="overflow-hidden"
          >
            <div className="px-1.5 pb-1.5 max-h-[70vh] overflow-y-auto border-t border-white/10 pt-1.5">
              <button
                onClick={() => setSelectedProject(aboutMe)}
                aria-current={aboutActive}
                className={`glass-row font-medium ${aboutActive ? 'bg-white/[0.08]' : ''}`}
              >
                <Dot color={SECTIONS.about.color} active={aboutActive} />
                About
              </button>
              {HUB_IDS.map(id => <SectionGroup key={id} hubId={id} />)}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
