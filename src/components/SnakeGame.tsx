import React, { useEffect, useRef, useState, useCallback } from 'react';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const SNAKE_SPEED = 12; // Frames per second

type Point = { x: number; y: number };

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIR: Point = { x: 0, y: -1 };

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // React State for UI
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Mutable Refs for Game Loop
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const dirRef = useRef<Point>(INITIAL_DIR);
  const nextDirRef = useRef<Point>(INITIAL_DIR);
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const isPlayingRef = useRef(false);
  const animationRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const saved = localStorage.getItem('sys_snake_max_yield');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  const startGame = () => {
    snakeRef.current = [...INITIAL_SNAKE];
    dirRef.current = { ...INITIAL_DIR };
    nextDirRef.current = { ...INITIAL_DIR };
    foodRef.current = generateFood(INITIAL_SNAKE);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    setHasStarted(true);
    lastRenderTimeRef.current = performance.now();
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid lines (harsh static look)
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i); ctx.stroke();
    }

    // Draw Food (Magenta)
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(
      foodRef.current.x * CELL_SIZE + 1,
      foodRef.current.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2
    );

    // Draw Snake (Cyan)
    snakeRef.current.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#ffffff' : '#00ffff';
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });
  }, []);

  const update = useCallback(() => {
    const snake = [...snakeRef.current];
    const dir = nextDirRef.current;
    dirRef.current = dir;

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // Wall Collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return false;
    }

    // Self Collision
    if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
      return false;
    }

    snake.unshift(head);

    // Food Collision
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      setScore((s) => {
        const newScore = s + 1;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('sys_snake_max_yield', newScore.toString());
        }
        return newScore;
      });
      foodRef.current = generateFood(snake);
    } else {
      snake.pop();
    }

    snakeRef.current = snake;
    return true;
  }, [generateFood, highScore]);

  const gameLoop = useCallback((currentTime: number) => {
    if (!isPlayingRef.current) return;

    animationRef.current = requestAnimationFrame(gameLoop);

    const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current) / 1000;
    if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;

    lastRenderTimeRef.current = currentTime;

    const isAlive = update();
    if (!isAlive) {
      setIsPlaying(false);
      setGameOver(true);
      cancelAnimationFrame(animationRef.current);
    }

    draw();
  }, [draw, update]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(animationRef.current);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, gameLoop]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (!isPlayingRef.current) return;

      const dir = dirRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (dir.y !== 1) nextDirRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (dir.y !== -1) nextDirRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (dir.x !== 1) nextDirRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (dir.x !== -1) nextDirRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-md">
      {/* Score Header */}
      <div className="w-full flex justify-between items-center mb-4 border-2 border-cyan-400 p-2 bg-black shadow-[4px_4px_0px_#f0f]">
        <div>
          <span className="text-cyan-400 font-pixel text-[10px] block mb-1">{"> DATA_YIELD"}</span>
          <span className="text-2xl font-mono text-fuchsia-500 leading-none">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
        
        <div className="text-right">
          <span className="text-cyan-400 font-pixel text-[10px] block mb-1">{"> MAX_YIELD"}</span>
          <span className="text-2xl font-mono text-fuchsia-500 leading-none">
            {highScore.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative border-4 border-fuchsia-500 shadow-[8px_8px_0px_#0ff] bg-black p-1">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-black block"
        />

        {/* Overlays */}
        {(!isPlaying && !gameOver) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
            <button
              onClick={startGame}
              className="bg-cyan-400 hover:bg-fuchsia-500 text-black px-6 py-4 font-pixel text-sm transition-colors shadow-[4px_4px_0px_#f0f] hover:shadow-[4px_4px_0px_#0ff]"
            >
              {hasStarted ? '[ RESUME_SEQ ]' : '[ INIT_SEQ ]'}
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 border-4 border-red-600 animate-pulse">
            <h2 className="text-2xl font-pixel text-red-500 mb-4 text-center glitch-text" data-text="FATAL_ERR">
              FATAL_ERR
            </h2>
            <p className="text-cyan-400 mb-8 font-mono text-xl">{"> YIELD: "}{score}</p>
            <button
              onClick={startGame}
              className="bg-fuchsia-500 hover:bg-cyan-400 text-black px-6 py-4 font-pixel text-sm transition-colors shadow-[4px_4px_0px_#0ff] hover:shadow-[4px_4px_0px_#f0f]"
            >
              [ REBOOT ]
            </button>
          </div>
        )}
      </div>
      
      {/* Controls Hint */}
      <div className="mt-6 text-cyan-400 font-pixel text-[10px] text-center border border-cyan-400/50 p-2 w-full">
        {"> INPUT: [W,A,S,D] OR [ARROWS]"}
      </div>
    </div>
  );
}
