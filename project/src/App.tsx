import React from 'react';
import { useState } from 'react';
import { Scene3D } from './components/Scene/Scene3D';
import { SearchBar } from './components/UI/SearchBar';
import { ProjectModal } from './components/UI/ProjectModal';
import { CosmicCursor } from './components/UI/CosmicCursor';
import { HelpPanel } from './components/UI/HelpPanel';
import { NavigatorPanel } from './components/UI/Navigator';
import { WelcomeModal } from './components/UI/WelcomeModal';
import { ProjectIntroduction } from './components/UI/ProjectIntroduction';
import { FloatingInfo } from './components/UI/FloatingInfo';
function App() {
  const [loading, setLoading] = useState(true);

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
  <div className="p-2 sm:p-4 flex justify-between items-start pointer-events-auto">
    {/* Left side: SearchBar, NavigatorPanel - more prominent */}
    <div className="flex flex-col gap-2 sm:gap-4 w-[80%] sm:w-auto">
      <SearchBar />
      <NavigatorPanel />
    </div>
    {/* Right side: Add help button */}
    <div className="mt-2 mr-1 sm:mr-2">
      <button 
        onClick={() => document.dispatchEvent(new CustomEvent('toggle-help'))}
        className="bg-gray-800/80 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-gray-700 transition-colors"
      >
        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
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