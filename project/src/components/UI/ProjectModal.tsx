import React from "react";
import { ExternalLink, Github, FileText, Mail, Linkedin, ChevronRight } from "lucide-react";
import { projects } from "../../data/projects";
import { useAppStore } from "../../store/useAppStore";
import { HUB_IDS, SECTIONS, sectionOf } from "../Scene/networkLayout";
import { Sheet } from "./Sheet";

// Renders description text: blank lines separate blocks, "- " lines become a list,
// and a plain line directly above a list becomes its heading
function Description({ text }: { text: string }) {
  return (
    <div className="mb-6 space-y-4 max-w-prose text-[15px] leading-relaxed text-white/85">
      {text.trim().split(/\n\s*\n/).map((block, i) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        const items = lines.filter((l) => l.startsWith('- ')).map((l) => l.slice(2));
        const prose = lines.filter((l) => !l.startsWith('- '));
        if (!items.length) return <p key={i}>{prose.join(' ')}</p>;
        return (
          <div key={i}>
            {prose.length > 0 && (
              <h3 className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55">{prose.join(' ')}</h3>
            )}
            <ul className="list-disc space-y-1 pl-5 marker:text-white/35">
              {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function ProjectModal() {
  const { selectedProject, setSelectedProject } = useAppStore();
  const p = selectedProject;
  const section = p ? SECTIONS[sectionOf(p.id)] : null;
  const connected = (p?.connections ?? [])
    .filter((id) => id !== "about-me")
    .map((id) => projects.find((x) => x.id === id))
    .filter((x): x is NonNullable<typeof x> => !!x);
  const isHub = !!p && HUB_IDS.includes(p.id);

  const connectedList = connected.length > 0 && (
    <div className={isHub ? "mb-6" : "mt-6"}>
      <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55 mb-2">{isHub ? "In This Section" : "Connected"}</h3>
      <div className="rounded-2xl bg-white/[0.06] p-1.5">
        {connected.map((c) => {
          const color = SECTIONS[sectionOf(c.id)].color;
          return (
            <button key={c.id} onClick={() => setSelectedProject(c)} className="glass-row">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="min-w-0">
                <span className="block truncate">{c.title}</span>
                {c.tagline && <span className="block truncate text-[12px] text-white/50">{c.tagline}</span>}
              </span>
              <ChevronRight size={16} className="ml-auto shrink-0 text-white/40" />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Sheet
      open={!!p}
      side
      onClose={() => setSelectedProject(null)}
      title={p?.title}
      subtitle={
        p && section && (
          <>
            {!HUB_IDS.includes(p.id) && (
              <span className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color: section.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: section.color, boxShadow: `0 0 8px ${section.color}` }} />
                {section.label}
              </span>
            )}
            {p.tagline && <span className="mt-1.5 block text-[15px] text-white/75">{p.tagline}</span>}
          </>
        )
      }
    >
      {p && (
        <>
          {/* Sections lead with what they contain */}
          {isHub && connectedList}

          {p.description && <Description text={p.description} />}

          {p.id === "resume" && (
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="btn-prominent w-full sm:w-auto">
              <FileText size={18} />
              Open Resume PDF
            </a>
          )}

          {p.id === "contact" && (
            <div className="flex flex-col sm:flex-row gap-3">
              {p.email && (
                <a href={`mailto:${p.email}`} className="btn-prominent">
                  <Mail size={18} />
                  {p.email}
                </a>
              )}
              {p.githubUrl && (
                <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-glass">
                  <Github size={18} />
                  GitHub
                </a>
              )}
              {p.linkedinUrl && (
                <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className="btn-glass">
                  <Linkedin size={18} />
                  LinkedIn
                </a>
              )}
            </div>
          )}

          {p.id !== "resume" && p.id !== "contact" && (
            <>
              {!isHub && p.technologies && p.technologies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/55 mb-2.5">
                    Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {p.technologies.map((tech) => (
                      <span key={tech} className="bg-white/10 text-white/90 px-3 py-1 rounded-full text-[13px] font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(p.demoUrl || p.githubUrl) && (
                <div className="flex flex-wrap gap-3">
                  {p.demoUrl && (
                    <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-prominent">
                      <ExternalLink size={16} />
                      Live Demo
                    </a>
                  )}
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={p.demoUrl ? "btn-glass" : "btn-prominent"}
                    >
                      <Github size={16} />
                      Source Code
                    </a>
                  )}
                </div>
              )}
            </>
          )}

          {!isHub && connectedList}
        </>
      )}
    </Sheet>
  );
}
