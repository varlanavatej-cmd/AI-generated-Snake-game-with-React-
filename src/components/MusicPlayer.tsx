import React, { useState, useRef, useEffect } from 'react';

const TRACKS = [
  { id: 1, title: 'SEQ_01: NEON_DRIVE', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'SEQ_02: CYBER_PULSE', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'SEQ_03: SYNTH_HORIZON', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const bounds = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const percentage = x / bounds.width;
      audioRef.current.currentTime = percentage * audioRef.current.duration;
      setProgress(percentage * 100);
    }
  };

  return (
    <div className="bg-black border-2 border-fuchsia-500 p-4 shadow-[4px_4px_0px_#0ff] w-full relative">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
      />

      <div className="border-b-2 border-fuchsia-500 pb-2 mb-4 flex justify-between items-end">
        <h2 className="text-lg font-pixel text-cyan-400">{"> AUDIO_STREAM"}</h2>
        <span className="text-fuchsia-500 text-sm animate-pulse">{isPlaying ? 'ACTIVE' : 'IDLE'}</span>
      </div>

      <div className="mb-6">
        <p className="text-fuchsia-500 font-mono text-xl truncate mb-2">
          FILE: {currentTrack.title}.wav
        </p>
        
        {/* Progress Bar */}
        <div 
          className="h-4 bg-gray-900 border border-cyan-400 cursor-pointer relative"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-fuchsia-500 transition-all duration-75"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-2 border-cyan-400 p-2">
          <button 
            onClick={playPrev}
            className="text-cyan-400 hover:text-fuchsia-500 hover:bg-cyan-900/30 px-2 py-1 font-pixel text-xs transition-colors"
          >
            [PREV]
          </button>
          
          <button 
            onClick={togglePlay}
            className="text-black bg-cyan-400 hover:bg-fuchsia-500 px-4 py-2 font-pixel text-sm transition-colors shadow-[2px_2px_0px_#f0f]"
          >
            {isPlaying ? 'HALT' : 'EXECUTE'}
          </button>
          
          <button 
            onClick={playNext}
            className="text-cyan-400 hover:text-fuchsia-500 hover:bg-cyan-900/30 px-2 py-1 font-pixel text-xs transition-colors"
          >
            [NEXT]
          </button>
        </div>

        <div className="flex items-center justify-between border-2 border-fuchsia-500 p-2">
          <span className="text-cyan-400 font-pixel text-xs">VOL_MOD:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 h-2 bg-gray-900 appearance-none cursor-pointer border border-cyan-400 accent-fuchsia-500"
            style={{
              accentColor: '#f0f'
            }}
          />
        </div>
      </div>
    </div>
  );
}
