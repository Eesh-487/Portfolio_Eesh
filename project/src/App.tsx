import React from 'react';
import { useEffect, useState } from 'react';
import { Scene3D } from './components/Scene/Scene3D';
import { ProjectModal } from './components/UI/ProjectModal';
import { CosmicCursor } from './components/UI/CosmicCursor';
import { HelpPanel } from './components/UI/HelpPanel';
import { WelcomeModal } from './components/UI/WelcomeModal';
import { ProjectIntroduction } from './components/UI/ProjectIntroduction';
import { FloatingInfo } from './components/UI/FloatingInfo';
import { UploadPage } from './components/UI/UploadPage';

function App() {
  const [loading, setLoading] = useState(true);
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      setPathname(nextPath);
    }
  };

  if (pathname === '/upload') {
    return <UploadPage onBack={() => navigateTo('/')} />;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden cursor-none font-quicksand">
      {/* 3D Scene */}
      <Scene3D onLoaded={() => setLoading(false)} />

      {/* UI Overlay */}
     <div className="absolute inset-0 pointer-events-none">
  {/* Centered heading */}
  <div className="w-full flex justify-center mt-2 sm:mt-6 pointer-events-auto">
    <div className="text-center">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-0 sm:mb-1 font-orbitron">Eesh Khanna</h1>
      <p className="text-gray-400 text-xs sm:text-sm">Transforming Ideas into Intelligent Solutions </p>
    </div>
  </div>
</div>

      {/* Modals and overlays */}
      <WelcomeModal />
      <ProjectIntroduction />
      <FloatingInfo />
      <ProjectModal />
      <HelpPanel />
      <CosmicCursor />

      {/* Loading fallback for WebGL */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-white z-50">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading cosmic experience...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;