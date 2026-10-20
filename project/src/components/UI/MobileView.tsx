import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { projects } from '../../data/projects';
import { HUB_IDS, SECTIONS, network, sectionOf } from '../Scene/networkLayout';
import { IdentityPanel } from './IdentityPanel';
import { UtilityBar } from './UtilityBar';

const byId = (id: string) => projects.find((p) => p.id === id);

// Phones get the same network as a vertical spine of sections and outputs
export function MobileView() {
  const [open, setOpen] = useState<string | null>('projects');
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);

  return (
    <div
      className="h-[100dvh] overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28"
      style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1.2px) 0 0 / 24px 24px, #050608' }}
    >
      <IdentityPanel />

      <div className="relative mt-6 pl-7">
        {/* The spine: input at the top, sections branching below */}
        <div className="absolute left-[11px] top-0 bottom-6 w-px bg-gradient-to-b from-[#ffc677]/50 via-white/15 to-transparent" />

        {HUB_IDS.map((hubId) => {
          const { label, color } = SECTIONS[sectionOf(hubId)];
          const hub = byId(hubId);
          const kids = (network.children.get(hubId) ?? []).map(byId).filter((c): c is NonNullable<typeof c> => !!c);
          const expanded = open === hubId;
          return (
            <section key={hubId} className="relative mb-3">
              <span
                className="absolute -left-[22px] top-5 w-3 h-3 rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
              />
              <div className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(expanded ? null : hubId)}
                  aria-expanded={expanded}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-[11px] font-semibold tracking-[0.14em]" style={{ color }}>
                      {label.toUpperCase()} / {String(kids.length).padStart(2, '0')}
                    </span>
                    <span className="mt-1 block text-[15px] text-white/80">{hub?.tagline}</span>
                  </span>
                  <ChevronDown size={18} className={`mt-1 text-white/50 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <div className="border-t border-white/10 p-1.5">
                    {kids.map((k) => (
                      <button key={k.id} onClick={() => setSelectedProject(k)} className="glass-row items-start py-2.5">
                        <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="min-w-0">
                          <span className="block text-[15px] font-medium text-white">{k.title}</span>
                          <span className="block text-[13px] text-white/55">{k.tagline}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <UtilityBar />
      </div>
    </div>
  );
}
