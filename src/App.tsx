/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Layers, Hourglass, Info, ChevronLeft, ChevronRight, Upload, Sparkles } from 'lucide-react';
import { HABIT_DATA as INITIAL_HABIT_DATA } from './data';
import { TimeRange, Habit, Entry, HabitData } from './types';

const LIFESPAN_YEARS = 50;
const BACKGROUND_COLOR = "#0a0a0a";

// Adjust these values to change the size and brightness of the central white dot and HUD
const CENTRAL_HUD_CONFIG = {
  glowRadius: 0.22,      // The size of the white glow/light
  glowOpacity: 1.0,     // How bright the glow is (0-1)
  innerRadius: 0.18,     // The size of the dark circle behind the text
  innerOpacity: 0.2,    // How dark it is when NOT hovered (0.2 is very transparent)
  corePointRadius: 0.08, // The tiny white core dot in the absolute center
  corePointOpacity: 0.6  // How bright the tiny core dot is
};

function LoadingLotus() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-12"
    >
      <div className="relative w-64 h-64">
        {/* Growing Lotus Petals */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-32 h-44 origin-bottom"
            style={{ 
              borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
              backgroundColor: `hsla(${280 + i * 15}, 70%, 60%, 0.3)`,
              border: '1px solid rgba(255,255,255,0.1)',
              marginLeft: '-64px',
              marginTop: '-176px',
            }}
            initial={{ scale: 0, rotate: i * 45, opacity: 0 }}
            animate={{ 
              scale: [0, 1.1, 1], 
              rotate: [i * 45, i * 45 + 10, i * 45],
              opacity: [0, 0.8, 0.4]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.2,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}
        {/* Glow in center */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full blur-2xl"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
      <div className="flex flex-col items-center gap-2">
        <motion.div 
          className="text-white text-xs uppercase tracking-[0.6em] font-light opacity-50"
          animate={{ opacity: [0.2, 0.6, 0.2], letterSpacing: ['0.4em', '0.8em', '0.4em'] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          Loading Life Lotus
        </motion.div>
        <motion.div 
          className="w-48 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent overflow-hidden"
        >
          <motion.div 
            className="w-full h-full bg-emerald-500/40"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [habitData, setHabitData] = useState<HabitData>(INITIAL_HABIT_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [range, setRange] = useState<TimeRange>('month');
  const [hoveredHabit, setHoveredHabit] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date('2026-05-03'));
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateSize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    // Artificial delay to show the lotus loading animation as requested
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-data', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // Reload data from the newly uploaded file
        // For the current session, we can just parse it and update state
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const raw = JSON.parse(event.target?.result as string);
            // We need to apply the same mapping logic as in data.ts
            // But since we can't easily import the complex mapping from data.ts here without exposing it,
            // we'll assume the server write succeeds and just reload or update state manually.
            
            // To be precise, let's just trigger a full reload since data.json is now updated on server
            window.location.reload();
          } catch (err) {
            console.error("Failed to parse uploaded JSON", err);
            setIsLoading(false);
          }
        };
        reader.readAsText(file);
      } else {
        alert("Upload failed. Make sure the file is a valid JSON.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Upload error", err);
      setIsLoading(false);
    }
  };

  const habits = habitData.habits;

  const aggregatedData = useMemo(() => {
    return habits.map(habit => {
      const habitEntries = habitData.entries.filter(e => Number(e.habitId) === Number(habit.id) && e.value > 0);
      let dots: { x: number; y: number; id: string }[] = [];
      let completionRate = 0;

      // Calculate target capacity based on frequency
      const getCapacity = (mode: TimeRange) => {
        const freq = habit.frequency;
        const num = habit.frequencyNumber || 1;
        
        if (mode === 'month') {
          if (freq === 'weekly') return num * 4.33;
          if (freq === 'monthly') return num;
          return 31; // daily or null
        }
        if (mode === 'year') {
          if (freq === 'weekly') return num * 52;
          if (freq === 'monthly') return num * 12;
          return 365;
        }
        if (mode === 'fiftyYears') {
          if (freq === 'weekly') return num * 52 * 50;
          if (freq === 'monthly') return num * 12 * 50;
          return 365 * 50;
        }
        return 1000;
      };

      if (range === 'month') {
        const targetMonth = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
        const monthEntries = habitEntries.filter(e => e.date.startsWith(targetMonth));
        
        dots = monthEntries.map(e => {
          const seed = e.date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + e.id;
          return { x: ((seed * 123.456) % 1), y: ((seed * 789.012) % 1), id: `e-${e.id}` };
        });
        completionRate = Math.min(100, (monthEntries.length / getCapacity('month')) * 100);
      } 
      else if (range === 'year') {
        const targetYear = selectedDate.getFullYear().toString();
        const yearEntries = habitEntries.filter(e => e.date.startsWith(targetYear));
        
        dots = yearEntries.map(e => {
          const seed = e.date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + e.id;
          return { x: ((seed * 123.456) % 1), y: ((seed * 789.012) % 1), id: `e-${e.id}` };
        });
        completionRate = Math.min(100, (yearEntries.length / getCapacity('year')) * 100);
      }
      else {
        // Fifty Years
        dots = habitEntries.map(e => {
          const seed = e.date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + e.id;
          return { x: ((seed * 123.456) % 1), y: ((seed * 789.012) % 1), id: `e-${e.id}` };
        });
        completionRate = Math.min(100, (habitEntries.length / getCapacity('fiftyYears')) * 100);
      }

      return { ...habit, dots, completionRate };
    });
  }, [range, habits, selectedDate]);

  const radius = Math.min(dimensions.width, dimensions.height) * 0.32;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2 - 40;

  const activeStreak = 14; 
  const totalBloom = (aggregatedData.reduce((acc, h) => acc + h.completionRate, 0) / aggregatedData.length).toFixed(1);

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    if (range === 'month') {
      d.setMonth(d.getMonth() + offset);
    } else {
      d.setFullYear(d.getFullYear() + offset);
    }
    setSelectedDate(d);
  };

  const currentLabel = range === 'month' 
    ? selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : selectedDate.getFullYear().toString();

  const hoveredHabitData = useMemo(() => {
    return aggregatedData.find(h => h.id === hoveredHabit);
  }, [hoveredHabit, aggregatedData]);

  const earliestDate = useMemo(() => {
    const dates = habitData.entries.map(e => new Date(e.date).getTime());
    return dates.length > 0 ? new Date(Math.min(...dates)) : new Date('2025-01-01');
  }, [habitData]);

  const weeksSinceStart = useMemo(() => {
    const now = new Date('2026-05-03');
    const diff = now.getTime() - earliestDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  }, [earliestDate]);

  return (
    <div className="fixed inset-0 overflow-hidden font-sans select-none bg-[#020202] text-slate-200">
      <AnimatePresence>
        {isLoading && <LoadingLotus />}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_90%)]"></div>
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden scale-110">
        <svg width="100%" height="100%">
          <defs>
            <radialGradient id="centralLight" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="20%" stopColor="white" stopOpacity="0.5" />
              <stop offset="60%" stopColor="white" stopOpacity="0.1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <filter id="lightGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="20" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
            <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="white" fillOpacity="0.4" />
            </pattern>
            <pattern id="grid-lived" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="#10b981" fillOpacity="0.6" />
            </pattern>
          </defs>
          {/* We simplify the lived weeks visualization for performance: just a solid block or split pattern */}
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width={`${Math.min(100, (weeksSinceStart / (50 * 52)) * 100)}%`} height="100%" fill="url(#grid-lived)" />
        </svg>
      </div>

      <header className="absolute top-0 left-0 w-full p-10 flex justify-between items-start z-20">
        <div>
          <h1 className="text-[10px] font-medium tracking-[0.5em] text-slate-600 uppercase">Living with Intent</h1>
          <div className="text-3xl font-light tracking-tight mt-1 flex items-center gap-4">
            <span>Lotus Habit <span className="italic font-serif opacity-40">Visualizer</span></span>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/5 transition-all group relative"
              title="Upload data.json"
            >
              <Upload size={16} className="text-slate-400 group-hover:text-emerald-400" />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".json" 
                className="hidden" 
              />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-10">
          <div className="flex gap-2 bg-white/5 backdrop-blur-3xl p-1 rounded-full border border-white/5 shadow-2xl">
            <RangeButton active={range === 'month'} onClick={() => setRange('month')} label="Month" />
            <RangeButton active={range === 'year'} onClick={() => setRange('year')} label="Year" />
            <RangeButton active={range === 'fiftyYears'} onClick={() => setRange('fiftyYears')} label="50 Years" />
          </div>

          {range !== 'fiftyYears' && (
            <div className="flex items-center gap-6 text-[11px] tracking-[0.3em] font-light text-slate-400 uppercase">
              <button onClick={() => changeDate(-1)} className="hover:text-white transition-all p-2 bg-white/5 rounded-full"><ChevronLeft size={16}/></button>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={currentLabel}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="min-w-[140px] text-center"
                >
                  {currentLabel}
                </motion.span>
              </AnimatePresence>
              <button onClick={() => changeDate(1)} className="hover:text-white transition-all p-2 bg-white/5 rounded-full"><ChevronRight size={16}/></button>
            </div>
          )}
        </div>
      </header>

      <svg width="100%" height="100%" className="block relative z-10">
        <defs>
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="24" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          {habits.map(habit => {
            const data = aggregatedData.find(h => h.id === habit.id);
            const rawRate = data ? data.completionRate / 100 : 0;
            // Visual normalization: boost lower rates so even 1 entry is visible
            const rate = Math.pow(rawRate, 0.4); 
            
            const baseOpacity = 0.15 + (rate * 0.75);
            const midOpacity = 0.05 + (rate * 0.35);
            return (
              <radialGradient id={`grad-${habit.id}`} key={habit.id} cx="50%" cy="100%" r="100%" fx="50%" fy="100%">
                <stop offset="0%" stopColor={habit.color} stopOpacity={baseOpacity} />
                <stop offset="70%" stopColor={habit.color} stopOpacity={midOpacity} />
                <stop offset="100%" stopColor={habit.color} stopOpacity="0.01" />
              </radialGradient>
            );
          })}
        </defs>

        <g transform={`translate(${centerX}, ${centerY})`}>
          {aggregatedData.map((habit, i) => {
            const angleStep = (2 * Math.PI) / aggregatedData.length;
            const midAngle = i * angleStep - Math.PI / 2;
            
            // petal shape refined
            const petalWidth = radius * 0.45;
            const d = `
              M 0 0
              Q ${-petalWidth * 1.1} ${-radius * 0.5} 0 ${-radius}
              Q ${petalWidth * 1.1} ${-radius * 0.5} 0 0
              Z
            `;

            const isHovered = hoveredHabit === habit.id;
            const isOtherHovered = hoveredHabit !== null && !isHovered;

            const rawRate = habit.completionRate / 100;
            // Boost visibility for low entries
            const rate = Math.pow(rawRate, 0.4);

            return (
              <g 
                key={habit.id} 
                onMouseEnter={() => setHoveredHabit(habit.id)} 
                onMouseLeave={() => setHoveredHabit(null)} 
                className="cursor-pointer"
                transform={`rotate(${(midAngle * 180) / Math.PI + 90})`}
                style={{ opacity: isOtherHovered ? 0.1 : 1, transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                <motion.path
                  key={`petal-${range}-${selectedDate.toISOString()}`}
                  d={d}
                  fill={`url(#grad-${habit.id})`}
                  stroke={habit.color}
                  strokeWidth={isHovered ? "4.5" : 0.8 + (rate * 4.5)}
                  initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isHovered ? 1.1 : 1,
                    rotate: 0,
                    strokeOpacity: isHovered ? 1 : 0.15 + (rate * 0.85)
                  }}
                  transition={{ 
                    opacity: { delay: i * 0.04, duration: 0.5 },
                    rotate: { delay: i * 0.04, duration: 0.6 },
                    scale: { type: 'spring', stiffness: 120, damping: 20 },
                    strokeOpacity: { duration: 0.5 }
                  }}
                  style={{ 
                    filter: isHovered 
                      ? 'url(#glow)' 
                      : `drop-shadow(0 0 ${1 + rate * 35}px ${habit.color}${Math.round(Math.min(1, rate * 1.5) * 255).toString(16).padStart(2, '0')})`
                  }}
                />

                <AnimatePresence mode="wait">
                  <motion.g
                    key={`${range}-${selectedDate.toISOString()}`}
                    initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
                    transition={{ delay: i * 0.04 + 0.1, duration: 0.4, ease: "easeOut" }}
                  >
                    {habit.dots.map((dot, idx) => {
                      const capacity = range === 'month' ? 31 : range === 'year' ? 365 : 365 * 50;
                      const fillProgress = idx / capacity;
                      
                      const rBase = radius * 0.22;
                      const rMax = radius * 0.95;
                      const r = rBase + (Math.pow(fillProgress, 0.7) * (rMax - rBase));
                      const normalizedY = Math.min(1, Math.max(0, (r - rBase) / (rMax - rBase)));
                      const currentMaxX = petalWidth * Math.pow(Math.sin(normalizedY * Math.PI), 0.7) * 0.95;
                      const dx = isNaN(currentMaxX) ? 0 : (dot.x - 0.5) * currentMaxX;
                      const dy = -r;

                      if (range === 'month') {
                        return (
                          <motion.circle
                            key={dot.id}
                            cx={dx}
                            cy={dy}
                            r={radius * (isHovered ? 0.013 : 0.011)}
                            fill={habit.color}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.005, duration: 0.3 }}
                            style={{ 
                              filter: isHovered ? `drop-shadow(0 0 10px ${habit.color}aa)` : 'none',
                              opacity: isOtherHovered ? 0.2 : 1
                            }}
                          />
                        );
                      }

                      return (
                        <circle
                          key={dot.id}
                          cx={dx}
                          cy={dy}
                          r={radius * (isHovered ? 0.013 : 0.011)}
                          fill={habit.color}
                          style={{ 
                            opacity: isOtherHovered ? 0.1 : 0.8,
                            filter: isHovered ? `drop-shadow(0 0 8px ${habit.color}88)` : 'none',
                          }}
                        />
                      );
                    })}
                  </motion.g>
                </AnimatePresence>
              </g>
            );
          })}

          {/* Central HUD Display */}
          <motion.circle 
            r={radius * CENTRAL_HUD_CONFIG.glowRadius} 
            fill="url(#centralLight)"
            animate={{ 
              opacity: hoveredHabitData ? 0.1 : CENTRAL_HUD_CONFIG.glowOpacity,
              scale: hoveredHabitData ? 0.8 : 1.1
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ filter: 'url(#lightGlow)' }}
          />
          <circle 
            r={radius * CENTRAL_HUD_CONFIG.innerRadius} 
            fill="#000" 
            fillOpacity={hoveredHabitData ? 0.6 : CENTRAL_HUD_CONFIG.innerOpacity} 
            style={{ transition: 'fill-opacity 0.5s' }} 
          />
          
          <AnimatePresence>
            {hoveredHabitData ? (
              <motion.g
                key="hud"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="pointer-events-none"
              >
                <text y="-25" textAnchor="middle" fontSize="22" fill="white" className="leading-none drop-shadow-lg">
                  {hoveredHabitData.emoji}
                </text>
                <text y="10" textAnchor="middle" fontSize="11" fill="white" className="uppercase font-medium tracking-[0.3em]">
                  {hoveredHabitData.name}
                </text>
                <text y="35" textAnchor="middle" fontSize="10" fill={hoveredHabitData.color} className="font-light tracking-[0.2em] uppercase opacity-90">
                  {hoveredHabitData.dots.length} {hoveredHabitData.dots.length === 1 ? 'entry' : 'entries'}
                </text>
              </motion.g>
            ) : null}
          </AnimatePresence>

          <circle 
            r={radius * CENTRAL_HUD_CONFIG.corePointRadius} 
            fill="white" 
            fillOpacity={CENTRAL_HUD_CONFIG.corePointOpacity} 
          />
        </g>
      </svg>

      <footer className="absolute bottom-0 left-0 w-full p-10 flex justify-center items-center z-20 text-slate-200">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 max-w-4xl px-12">
          {habits.map(h => (
            <div 
              key={h.id} 
              className={`flex items-center gap-2 group cursor-pointer transition-all duration-500 ${hoveredHabit === h.id ? 'opacity-100 translate-y-[-2px]' : 'opacity-30 hover:opacity-70'}`}
              onMouseEnter={() => setHoveredHabit(h.id)} 
              onMouseLeave={() => setHoveredHabit(null)}
            >
              <div 
                className="w-1.5 h-1.5 rounded-full transition-transform duration-300 group-hover:scale-125" 
                style={{ backgroundColor: h.color, boxShadow: hoveredHabit === h.id ? `0 0 12px ${h.color}` : 'none' }}
              ></div>
              <span className="text-[12px] flex items-center gap-2 whitespace-nowrap text-slate-200 font-light tracking-[0.05em]">
                <span className="opacity-80 scale-90">{h.emoji}</span>
                <span className="opacity-60 group-hover:opacity-100 transition-opacity">{h.name}</span>
              </span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

function RangeButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
        active ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'text-slate-400 hover:text-white'
      }`}
    >
      <span className="uppercase text-[10px] tracking-widest">{label}</span>
    </button>
  );
}
