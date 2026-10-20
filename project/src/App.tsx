import React from 'react';
import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { HelpCircle, RotateCcw, Pause, Play, List, Network } from 'lucide-react';
import { Scene3D } from './components/Scene/Scene3D';
import { SearchBar } from './components/UI/SearchBar';
import { ProjectModal } from './components/UI/ProjectModal';
import { HelpPanel } from './components/UI/HelpPanel';
import { NavigatorPanel } from './components/UI/Navigator';
import { FloatingInfo } from './components/UI/FloatingInfo';
import { IdentityPanel } from './components/UI/IdentityPanel';
import { UtilityBar } from './components/UI/UtilityBar';
import { MobileView } from './components/UI/MobileView';
import { useAppStore } from './store/useAppStore';

const PHONE = '(max-width: 767px)';

function useIsPhone() {
  const [phone, setPhone] = useState(() => window.matchMedia(PHONE).matches);
  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const onChange = () => setPhone(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return phone;
}

function ViewControls() {
  const paused = useAppStore((s) => s.motionPaused);
  const toggleMotion = useAppStore((s) => s.toggleMotion);
  return (
    <div className="glass flex items-center gap-0.5 rounded-full p-1">
      <button
        onClick={() => document.dispatchEvent(new CustomEvent('reset-view'))}
        aria-label="Reset view"
        title="Reset view"
        className="icon-btn hover:bg-white/10"
      >
        <RotateCcw size={18} />
      </button>
      <button
        onClick={toggleMotion}
        aria-label={paused ? 'Play animation' : 'Pause animation'}
        title={paused ? 'Play animation' : 'Pause animation'}
        className="icon-btn hover:bg-white/10"
      >
        {paused ? <Play size={18} /> : <Pause size={18} />}
      </button>
    </div>
  );
}

function ViewToggle({ list, onToggle }: { list: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={list ? 'Show network' : 'Show as list'}
      title={list ? 'Show network' : 'Show as list'}
      className="icon-btn glass pointer-events-auto"
    >
      {list ? <Network size={20} /> : <List size={20} />}
    </button>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [listView, setListView] = useState(false);
  const phone = useIsPhone();

  const loader = loading && (
    <div className="absolute inset-0 bg-[#050608] flex items-center justify-center text-white z-50" role="status">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4 motion-reduce:animate-none"></div>
        <p className="text-[15px] text-white/70">Initializing network…</p>
      </div>
    </div>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative w-full h-[100dvh] overflow-hidden font-sans">
        {phone && listView ? (
          <>
            <MobileView />
            <div className="fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-20">
              <ViewToggle list onToggle={() => setListView(false)} />
            </div>
          </>
        ) : phone ? (
          <>
            <Scene3D onLoaded={() => setLoading(false)} />

            {/* Phone layer: who this is on top, quick links at the thumb */}
            <div className="absolute inset-0 pointer-events-none px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
              <header className="flex items-start gap-2">
                <div className="flex-1 min-w-0 pointer-events-auto">
                  <IdentityPanel />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => document.dispatchEvent(new CustomEvent('toggle-help'))}
                    aria-label="Help"
                    className="icon-btn glass pointer-events-auto"
                  >
                    <HelpCircle size={20} />
                  </button>
                  <ViewToggle list={false} onToggle={() => setListView(true)} />
                </div>
              </header>

              <div className="absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] flex justify-center pointer-events-auto">
                <UtilityBar />
              </div>
            </div>

            <FloatingInfo />
            {loader}
          </>
        ) : (
          <>
            <Scene3D onLoaded={() => setLoading(false)} />

            {/* Floating functional layer */}
            <div className="absolute inset-0 pointer-events-none p-5">
              <header className="flex items-start justify-between gap-3">
                <div className="relative z-10 flex flex-col gap-3 w-72 pointer-events-auto">
                  <div className="lg:hidden">
                    <IdentityPanel />
                  </div>
                  <SearchBar />
                  <NavigatorPanel />
                </div>

                <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-5 pointer-events-auto">
                  <IdentityPanel />
                </div>

                <button
                  onClick={() => document.dispatchEvent(new CustomEvent('toggle-help'))}
                  aria-label="Help"
                  className="icon-btn glass pointer-events-auto"
                >
                  <HelpCircle size={20} />
                </button>
              </header>

              <div className="absolute bottom-5 left-5 pointer-events-auto">
                <ViewControls />
              </div>
              <div className="absolute bottom-5 right-5 pointer-events-auto">
                <UtilityBar />
              </div>
            </div>

            <FloatingInfo />

            {/* Loading fallback for WebGL */}
            {loader}
          </>
        )}

        <ProjectModal />
        <HelpPanel />
      </div>
    </MotionConfig>
  );
}

export default App;
