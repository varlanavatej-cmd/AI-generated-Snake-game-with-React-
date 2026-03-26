import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col items-center justify-center p-4 relative overflow-hidden scanlines crt-flicker">
      {/* Static Noise Overlay */}
      <div className="absolute inset-0 bg-noise z-0"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center screen-tear">
        <header className="mb-8 text-center border-b-4 border-fuchsia-500 pb-4 w-full max-w-4xl">
          <h1 
            className="text-4xl md:text-6xl font-pixel glitch-text mb-2 tracking-tighter" 
            data-text="SYS.SNAKE_PROTOCOL"
          >
            SYS.SNAKE_PROTOCOL
          </h1>
          <p className="text-fuchsia-500 text-xl font-mono tracking-widest animate-pulse">
            {"> STATUS: COMPROMISED // OVERRIDE_ENGAGED"}
          </p>
        </header>

        <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-start justify-center w-full">
          {/* Left Column: Music Player */}
          <div className="w-full max-w-md order-2 xl:order-1 flex flex-col gap-6 xl:flex-1 xl:items-end">
            <div className="w-full max-w-sm">
              <MusicPlayer />
              
              {/* Diagnostics */}
              <div className="hidden xl:block bg-black border-2 border-cyan-400 p-4 mt-6 shadow-[4px_4px_0px_#f0f]">
                <h3 className="text-fuchsia-500 text-lg font-pixel mb-4 border-b-2 border-cyan-400 pb-2">{"> DIAGNOSTICS"}</h3>
                <div className="space-y-2 font-mono text-xl">
                  <div className="flex justify-between">
                    <span className="text-cyan-400">CPU_LOAD</span>
                    <span className="text-fuchsia-500 animate-pulse">ERR_0x99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400">MEM_ALLOC</span>
                    <span className="text-cyan-400">CORRUPTED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400">NET_UPLINK</span>
                    <span className="text-fuchsia-500">SEVERED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Game */}
          <div className="order-1 xl:order-2 xl:flex-none">
            <SnakeGame />
          </div>

          {/* Right Column: Empty for balance */}
          <div className="hidden xl:block order-3 xl:flex-1"></div>
        </div>
      </div>
    </div>
  );
}
