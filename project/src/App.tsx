import { useState } from 'react';
import { Scene3D } from './components/Scene/Scene3D';
import { SearchBar } from './components/UI/SearchBar';
import { FilterPanel } from './components/UI/FilterPanel';
import { ProjectModal } from './components/UI/ProjectModal';
import { CosmicCursor } from './components/UI/CosmicCursor';
import { HelpPanel } from './components/UI/HelpPanel';
import { NavigatorPanel } from './components/UI/Navigator';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="relative w-full h-screen overflow-hidden cursor-none">
      {/* 3D Scene */}
      <Scene3D onLoaded={() => setLoading(false)} />

      {/* UI Overlay */}
     <div className="absolute inset-0 pointer-events-none">
  {/* Centered heading */}
  <div className="w-full flex justify-center mt-6 pointer-events-auto">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-white mb-1">Eesh Khanna</h1>
      <p className="text-gray-400 text-sm">Transforming Ideas into Intelligent Solutions </p>
    </div>
  </div>
  <div className="p-4 flex justify-between items-start pointer-events-auto">
    {/* Left side: SearchBar, NavigatorPanel */}
    <div className="flex flex-col gap-4">
      <SearchBar />
      <NavigatorPanel />
    </div>
  </div>
</div>

      {/* Modals and overlays */}
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