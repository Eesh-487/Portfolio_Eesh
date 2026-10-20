import React, { useEffect, useState } from 'react';
import { Move3d, ZoomIn, CircleDot, Search, X, Eye, RotateCcw } from 'lucide-react';
import { Sheet } from './Sheet';

const controls = [
  { key: 'Drag', action: 'Rotate the network', icon: Move3d },
  { key: 'Scroll or Pinch', action: 'Zoom in and out', icon: ZoomIn },
  { key: 'Click a Neuron', action: 'Open that section or project', icon: CircleDot },
  { key: 'Search', action: 'Activate the neurons that match', icon: Search },
  { key: 'Hover a Neuron', action: 'Preview it and light up its connections', icon: Eye },
  { key: 'Esc or Click Empty Space', action: 'Close the open panel', icon: X },
  { key: 'Reset and Pause', action: 'Bottom-left controls recentre the view and stop animation', icon: RotateCcw },
];

export function HelpPanel() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setIsOpen((v) => !v);
    document.addEventListener('toggle-help', toggle);
    return () => document.removeEventListener('toggle-help', toggle);
  }, []);

  return (
    <Sheet open={isOpen} onClose={() => setIsOpen(false)} title="How to Explore"
      subtitle="Input: me. Hidden layer: what I do. Outputs: what I've built." className="max-w-md">
      <ul className="rounded-2xl bg-white/[0.06] divide-y divide-white/10">
        {controls.map(({ key, action, icon: Icon }) => (
          <li key={key} className="flex items-center gap-3 px-4 min-h-[52px]">
            <Icon size={18} className="text-cyan-300 shrink-0" />
            <div className="py-2">
              <div className="text-white text-[15px] font-medium">{key}</div>
              <div className="text-white/60 text-[13px]">{action}</div>
            </div>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
