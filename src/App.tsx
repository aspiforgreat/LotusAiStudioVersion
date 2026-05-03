/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Layers, Hourglass, Info, ChevronLeft, ChevronRight, Upload, Sparkles, RotateCcw, Settings, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { HABIT_DATA as INITIAL_HABIT_DATA, mapRawData, SAMPLE_DATA } from './data';
import { TimeRange, Habit, Entry, HabitData } from './types';

const LIFESPAN_YEARS = 50;

// Dynamic configuration based on theme
const THEMES = {
  dark: {
    bg: "#020202",
    text: "#e2e8f0",
    textMuted: "text-slate-600",
    headerBg: "bg-white/5",
    petalOpacity: 1,
    centralGlow: "white"
  },
  light: {
    bg: "#fcfcfd",
    text: "#0f172a",
    textMuted: "text-slate-400",
    headerBg: "bg-black/[0.03]",
    panelBg: "bg-white/95",
    petalOpacity: 0.9,
    centralGlow: "white"
  }
};

// Adjust these values to change the size and brightness of the central white dot and HUD
const CENTRAL_HUD_CONFIG = {
  glowRadius: 0.22,      // The size of the white glow/light
  glowOpacity: 0.8,     // How bright the glow is (0-1)
  innerRadius: 0.18,     // The size of the dark circle behind the text
  innerOpacity: 0.15,    // How dark it is when NOT hovered
  corePointRadius: 0.08, // The tiny white core dot in the absolute center
  corePointOpacity: 0.9  // How bright the tiny core dot is
};

function WelcomeScreen({ onUpload, onLoadSample, theme }: { onUpload: () => void; onLoadSample: () => void; theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[50] flex flex-col items-center justify-center p-6 text-center transition-colors duration-1000 ${isDark ? 'bg-[#020202]' : 'bg-[#f8fafc]'}`}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center border transition-colors ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
          >
            <Sparkles className="text-emerald-400 w-10 h-10" />
          </motion.div>
          <h2 className={`text-3xl font-light tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Begin your <span className="italic font-serif opacity-60">visual journey</span></h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-light leading-relaxed`}>
            Lotus Habit Visualizer transforms your atomic habit data into a living, breathing garden of growth.
          </p>
        </div>

        <div className="grid gap-4 pt-4">
          <button 
            onClick={onUpload}
            className={`group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-medium transition-all active:scale-95 overflow-hidden ${isDark ? 'bg-white text-black hover:bg-emerald-50' : 'bg-slate-900 text-white hover:bg-emerald-950'}`}
          >
            <Upload size={20} />
            <span>Upload your data.json</span>
          </button>

          <button 
            onClick={onLoadSample}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-light border transition-all active:scale-95 ${isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/5' : 'bg-black/5 hover:bg-black/10 text-slate-900 border-black/5'}`}
          >
            <Layers size={18} className="opacity-60" />
            <span>Explore with Sample Data</span>
          </button>
        </div>

        <p className={`text-[10px] uppercase tracking-[0.3em] transition-opacity ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          Your data stays in your browser
        </p>
      </div>
    </motion.div>
  );
}

function LoadingLotus({ theme }: { theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-12 transition-colors duration-1000 ${isDark ? 'bg-black' : 'bg-slate-50'}`}
    >
      <div className="relative w-64 h-64">
        {/* Growing Lotus Petals */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 w-32 h-44 origin-bottom"
            style={{ 
              borderRadius: '50% 50% 50% 50% / 100% 100% 0% 0%',
              backgroundColor: `hsla(${280 + i * 15}, 70%, 60%, ${isDark ? 0.3 : 0.4})`,
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
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
          className={`text-xs uppercase tracking-[0.6em] font-light opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}
          animate={{ opacity: [0.2, 0.6, 0.2], letterSpacing: ['0.4em', '0.8em', '0.4em'] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          Loading Life Lotus
        </motion.div>
        <motion.div 
          className={`w-48 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent overflow-hidden`}
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
  
  // Style Settings
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('lotus_theme') as 'dark' | 'light') || 'dark';
  });
  const [showOutlines, setShowOutlines] = useState<boolean>(() => {
    const stored = localStorage.getItem('lotus_show_outlines');
    return stored === null ? true : stored === 'true';
  });
  const [glowIntensity, setGlowIntensity] = useState<number>(() => {
    return Number(localStorage.getItem('lotus_glow_intensity')) || 1;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('lotus_theme', theme);
    localStorage.setItem('lotus_show_outlines', String(showOutlines));
    localStorage.setItem('lotus_glow_intensity', String(glowIntensity));
  }, [theme, showOutlines, glowIntensity]);

  useEffect(() => {
    const updateSize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', updateSize);
    updateSize();

    // Load from local storage if exists
    const storedData = localStorage.getItem('lotus_habit_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.habits && parsed.entries) {
          setHabitData(mapRawData(parsed));
        }
      } catch (err) {
        console.error("Failed to load local storage data", err);
      }
    }

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    // Artificial delay for the lotus animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        
        // Basic validation
        if (!raw.habits || !raw.entries) {
          throw new Error("Invalid format: missing habits or entries");
        }

        const mapped = mapRawData(raw);

        // Save to local storage (save the raw data or mapped data? preferably raw so we can re-map if we change logic)
        localStorage.setItem('lotus_habit_data', JSON.stringify(raw));
        
        // Update state
        setHabitData(mapped);
        setIsLoading(false);
      } catch (err) {
        alert("Parsing failed: " + (err instanceof Error ? err.message : "Invalid JSON"));
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      alert("Failed to read file");
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    if (confirm("Reset to default visualization? This will clear your uploaded data.")) {
      localStorage.removeItem('lotus_habit_data');
      setHabitData(INITIAL_HABIT_DATA);
    }
  };

  const loadSampleData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setHabitData(SAMPLE_DATA);
      setIsLoading(false);
    }, 1500);
  };

  const habits = habitData.habits;

  useEffect(() => {
    if (habitData.entries.length > 0) {
      const dates = habitData.entries.map(e => new Date(e.date).getTime());
      const latestDate = new Date(Math.max(...dates));
      setSelectedDate(latestDate);
    }
  }, [habitData]);

  const aggregatedData = useMemo(() => {
    return habits.map(habit => {
      const habitEntries = habitData.entries.filter(e => Number(e.habitId) === Number(habit.id) && e.value > 0);
      let shellCount = 0;
      let completionRate = 0;

      // Grouping logic for fractal shells
      if (range === 'month') {
        const targetMonth = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
        const monthEntries = habitEntries.filter(e => e.date.startsWith(targetMonth));
        shellCount = monthEntries.length;
        completionRate = Math.min(100, (shellCount / 31) * 100);
      } 
      else if (range === 'year') {
        const targetYear = selectedDate.getFullYear().toString();
        const yearEntries = habitEntries.filter(e => e.date.startsWith(targetYear));
        // Group by week
        const activeWeeks = new Set(yearEntries.map(e => {
          const d = new Date(e.date);
          const onejan = new Date(d.getFullYear(), 0, 1);
          return Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
        }));
        shellCount = activeWeeks.size;
        completionRate = Math.min(100, (shellCount / 52) * 100);
      }
      else {
        // Fifty Years - Group by year (Mastery Tiers)
        const activeYears = new Set(habitEntries.map(e => e.date.split('-')[0]));
        shellCount = activeYears.size;
        completionRate = Math.min(100, (shellCount / LIFESPAN_YEARS) * 100);
      }

      return { ...habit, shellCount, completionRate };
    });
  }, [range, habits, selectedDate]);

  const radius = Math.min(dimensions.width, dimensions.height) * 0.32;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2 - 40;

  const activeStreak = 14; 
  const totalBloom = (aggregatedData.length > 0 
    ? aggregatedData.reduce((acc, h) => acc + h.completionRate, 0) / aggregatedData.length 
    : 0).toFixed(1);

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
    <div 
      className="fixed inset-0 overflow-hidden font-sans select-none transition-colors duration-1000"
      style={{ backgroundColor: THEMES[theme].bg, color: THEMES[theme].text }}
    >
      <AnimatePresence>
        {isLoading && <LoadingLotus theme={theme} />}
        {!isLoading && habits.length === 0 && (
          <WelcomeScreen 
            onUpload={() => fileInputRef.current?.click()} 
            onLoadSample={loadSampleData} 
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* Settings Panel Toggle */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60] flex flex-col items-end gap-3 translate-y-[-10px] md:translate-y-0">
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`${theme === 'dark' ? THEMES[theme].headerBg : THEMES[theme].panelBg} backdrop-blur-3xl p-6 rounded-3xl border ${theme === 'dark' ? 'border-white/10' : 'border-black/5'} shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-64 space-y-6 overflow-hidden relative pointer-events-auto mb-2`}
            >
              <div className="space-y-4">
                <div className={`text-[10px] uppercase tracking-[0.2em] font-semibold opacity-40 ${theme === 'dark' ? '' : 'text-slate-900'}`}>Appearance</div>
                
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-light ${theme === 'dark' ? '' : 'text-slate-700'}`}>Theme</span>
                  <div className={`flex p-1 rounded-full border ${theme === 'dark' ? 'bg-black/20 border-white/5' : 'bg-slate-200 border-black/5'}`}>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'bg-white/10 text-emerald-400' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <Moon size={14} />
                    </button>
                    <button 
                      onClick={() => setTheme('light')}
                      className={`p-2 rounded-full transition-all ${theme === 'light' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Sun size={14} />
                    </button>
                  </div>
                </div>

                {/* Outline Toggle */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-light ${theme === 'dark' ? '' : 'text-slate-700'}`}>Bloom Outlines</span>
                  <button 
                    onClick={() => setShowOutlines(!showOutlines)}
                    className={`p-2 rounded-full transition-all ${showOutlines ? (theme === 'dark' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/10') : (theme === 'dark' ? 'bg-black/20 text-slate-500 border border-white/5' : 'bg-slate-200 text-slate-400 border border-black/5')}`}
                  >
                    {showOutlines ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>

                {/* Glow Intensity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-light">
                    <span className={theme === 'dark' ? '' : 'text-slate-700'}>Glow Intensity</span>
                    <span className={theme === 'dark' ? '' : 'text-slate-700'}>{Math.round(glowIntensity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1.5" 
                    step="0.1" 
                    value={glowIntensity}
                    onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                    className="w-full h-1 bg-black/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>

              {localStorage.getItem('lotus_habit_data') && (
                <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                  <button 
                    onClick={resetData}
                    className="flex items-center gap-3 text-xs font-light text-slate-500 hover:text-red-400 transition-colors py-1 px-2 hover:bg-red-500/10 rounded-lg"
                  >
                    <RotateCcw size={12} />
                    Reset Data
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(!showSettings)}
          className={`${THEMES[theme].headerBg} backdrop-blur-xl p-3 rounded-full border ${theme === 'dark' ? 'border-white/10' : 'border-black/5'} shadow-2xl transition-all pointer-events-auto`}
        >
          <Settings size={20} className={showSettings ? 'text-emerald-400' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-600')} />
        </motion.button>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 transition-all duration-1000 ${theme === 'dark' ? 'bg-emerald-500/5' : 'bg-emerald-500/15'} rounded-full blur-[120px]`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-[500px] h-[500px] transition-all duration-1000 ${theme === 'dark' ? 'bg-blue-600/5' : 'bg-blue-600/15'} rounded-full blur-[150px]`}></div>
        <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-[0.03]' : 'opacity-[0.1]'} pointer-events-none flex items-center justify-center overflow-hidden scale-110`}>
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill={theme === 'dark' ? "white" : "black"} fillOpacity="0.4" />
              </pattern>
              <pattern id="grid-lived" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#10b981" fillOpacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width={`${Math.min(100, (weeksSinceStart / (50 * 52)) * 100)}%`} height="100%" fill="url(#grid-lived)" />
          </svg>
        </div>
      </div>

      <header className="absolute top-0 left-0 w-full p-6 md:p-10 flex flex-col md:flex-row justify-between items-center md:items-start z-20 gap-6 md:gap-0 pointer-events-none">
        <div className="flex flex-col items-center md:items-start pointer-events-auto">
          <h1 className={`text-[9px] md:text-[10px] font-semibold tracking-[0.4em] md:tracking-[0.5em] transition-colors duration-500 uppercase ${theme === 'dark' ? 'text-slate-600' : 'text-slate-500'}`}>Living with Intent</h1>
          <div className={`text-xl md:text-3xl font-light tracking-tight mt-1 flex items-center gap-3 md:gap-4 transition-all duration-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900 font-medium'}`}>
            <span>Lotus Habit <span className="italic font-serif opacity-40">Visualizer</span></span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`${THEMES[theme].headerBg} hover:bg-black/10 p-2 rounded-full border border-white/5 transition-all group relative`}
                title="Upload own data.json"
              >
                <Upload size={14} className={`md:w-4 md:h-4 opacity-50 group-hover:text-emerald-400 group-hover:opacity-100 transition-all`} />
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
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-6 md:gap-10 pointer-events-auto">
          <div className={`flex gap-1 md:gap-2 ${THEMES[theme].headerBg} backdrop-blur-3xl p-1 rounded-full border border-white/5 shadow-2xl`}>
            <RangeButton active={range === 'month'} onClick={() => setRange('month')} label="Month" theme={theme} />
            <RangeButton active={range === 'year'} onClick={() => setRange('year')} label="Year" theme={theme} />
            <RangeButton active={range === 'fiftyYears'} onClick={() => setRange('fiftyYears')} label="50 Years" theme={theme} />
          </div>

          {range !== 'fiftyYears' && (
            <div className={`flex items-center gap-4 md:gap-6 text-[9px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] font-light transition-colors duration-500 uppercase ${THEMES[theme].textMuted}`}>
              <button 
                onClick={() => changeDate(-1)} 
                className={`hover:bg-emerald-500/10 transition-all p-1.5 md:p-2 ${THEMES[theme].headerBg} rounded-full border border-white/5`}
              >
                <ChevronLeft size={14} className="md:w-4 md:h-4"/>
              </button>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={currentLabel}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="min-w-[100px] md:min-w-[140px] text-center"
                >
                  {currentLabel}
                </motion.span>
              </AnimatePresence>
              <button 
                onClick={() => changeDate(1)} 
                className={`hover:bg-emerald-500/10 transition-all p-1.5 md:p-2 ${THEMES[theme].headerBg} rounded-full border border-white/5`}
              >
                <ChevronRight size={14} className="md:w-4 md:h-4"/>
              </button>
            </div>
          )}
        </div>
      </header>

      <svg width="100%" height="100%" className="block relative z-10">
        <defs>
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={14 * glowIntensity} result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <radialGradient id="centralLight" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor={THEMES[theme].centralGlow} stopOpacity={0.9 * glowIntensity} />
            <stop offset="100%" stopColor={THEMES[theme].centralGlow} stopOpacity="0" />
          </radialGradient>
          {habits.map(habit => {
            const data = aggregatedData.find(h => h.id === habit.id);
            const rawRate = data ? data.completionRate / 100 : 0;
            const rate = Math.pow(rawRate, 0.4); 
            
            const baseOpacity = (0.15 + (rate * 0.75)) * THEMES[theme].petalOpacity;
            const midOpacity = (0.05 + (rate * 0.35)) * THEMES[theme].petalOpacity;
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
                  stroke={showOutlines ? habit.color : "none"}
                  strokeWidth={showOutlines ? (isHovered ? "4" : 0.5 + (rate * 3)) : 0}
                  strokeOpacity={showOutlines ? (isHovered ? 1 : 0.1 + (rate * 0.7)) : 0}
                  initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                  animate={{ 
                    opacity: THEMES[theme].petalOpacity, 
                    scale: isHovered ? 1.1 : 1,
                    rotate: 0,
                  }}
                  transition={{ 
                    opacity: { delay: i * 0.04, duration: 0.5 },
                    rotate: { delay: i * 0.04, duration: 0.6 },
                    scale: { type: 'spring', stiffness: 120, damping: 20 },
                  }}
                  style={{ 
                    filter: isHovered 
                      ? 'url(#glow)' 
                      : (glowIntensity > 0.5 ? `drop-shadow(0 0 ${4 * glowIntensity}px ${habit.color}22)` : 'none'),
                    transition: 'filter 0.3s ease'
                  }}
                />

                <AnimatePresence mode="wait">
                  <motion.g
                    key={`${range}-${selectedDate.toISOString()}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ mixBlendMode: theme === 'dark' ? 'screen' : 'multiply' }}
                  >
                    {Array.from({ length: habit.shellCount }).map((_, idx) => {
                      // Scaling logic: 10% to 100%
                      const scaleFactor = 0.1 + (0.9 * ((idx + 1) / habit.shellCount));
                      
                      // Using the same d path as the parent but scaled
                      return (
                        <motion.path
                          key={`shell-${idx}`}
                          d={d}
                          fill="none"
                          stroke={habit.color}
                          strokeWidth={isHovered ? 1.2 : 0.8}
                          strokeOpacity={isHovered ? 0.6 : 0.3}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: isHovered 
                              ? [scaleFactor, scaleFactor * 1.05, scaleFactor] 
                              : scaleFactor,
                            opacity: 1
                          }}
                          transition={{ 
                            scale: isHovered 
                              ? { duration: 2, repeat: Infinity, ease: "easeInOut", delay: idx * 0.05 }
                              : { duration: 0.5, delay: idx * 0.01 },
                            opacity: { duration: 0.3 }
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
              opacity: hoveredHabitData ? 0.05 : CENTRAL_HUD_CONFIG.glowOpacity * glowIntensity,
              scale: hoveredHabitData ? 0.8 : 1.1
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ filter: 'url(#lightGlow)' }}
          />

          {/* Inner HUD Background Circle */}
          <motion.circle 
            r={radius * CENTRAL_HUD_CONFIG.innerRadius} 
            fill={theme === 'dark' ? "#000" : "#fff"} 
            animate={{ 
              fillOpacity: hoveredHabitData ? (theme === 'dark' ? 0.75 : 0.98) : (theme === 'dark' ? CENTRAL_HUD_CONFIG.innerOpacity : 0.3),
              scale: hoveredHabitData ? 1.05 : 1
            }}
            transition={{ duration: 0.5 }}
            style={{ 
              filter: theme === 'light' ? 'drop-shadow(0 8px 20px rgba(0,0,0,0.1))' : 'none'
            }}
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
                <text y="-25" textAnchor="middle" fontSize="22" fill={theme === 'dark' ? "white" : "black"} className="leading-none drop-shadow-lg">
                  {hoveredHabitData.emoji}
                </text>
                <text y="10" textAnchor="middle" fontSize="11" fill={theme === 'dark' ? "white" : "black"} className="uppercase font-medium tracking-[0.3em]">
                  {hoveredHabitData.name}
                </text>
                <text y="35" textAnchor="middle" fontSize="10" fill={hoveredHabitData.color} className="font-light tracking-[0.2em] uppercase opacity-90 font-semibold">
                  {hoveredHabitData.shellCount} {range === 'month' ? 'active days' : range === 'year' ? 'active weeks' : 'active years'}
                </text>
              </motion.g>
            ) : null}
          </AnimatePresence>

          <motion.circle 
            r={radius * CENTRAL_HUD_CONFIG.corePointRadius} 
            fill="white" 
            animate={{ 
              opacity: hoveredHabitData ? 0 : CENTRAL_HUD_CONFIG.corePointOpacity,
              scale: hoveredHabitData ? 0.5 : 1
            }}
            stroke={theme === 'light' ? 'rgba(0,0,0,0.1)' : 'none'}
            strokeWidth={0.5}
          />
        </g>
      </svg>

      <footer className={`absolute bottom-0 left-0 w-full p-6 md:p-10 flex justify-center items-center z-20 transition-colors duration-500 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
        <div className="flex flex-wrap justify-center gap-x-6 md:gap-x-12 gap-y-3 max-w-4xl px-6 md:px-12">
          {habits.map(h => (
            <div 
              key={h.id} 
              className={`flex items-center gap-2 group cursor-pointer transition-all duration-500 ${hoveredHabit === h.id ? 'opacity-100 translate-y-[-2px]' : 'opacity-40 hover:opacity-100'}`}
              onMouseEnter={() => setHoveredHabit(h.id)} 
              onMouseLeave={() => setHoveredHabit(null)}
            >
              <div 
                className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-transform duration-300 group-hover:scale-125" 
                style={{ backgroundColor: h.color, boxShadow: hoveredHabit === h.id ? `0 0 12px ${h.color}` : 'none' }}
              ></div>
              <span className={`text-[10px] md:text-[12px] flex items-center gap-1.5 md:gap-2 whitespace-nowrap font-light tracking-[0.05em] transition-colors ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900 text-opacity-70'}`}>
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

function RangeButton({ active, onClick, label, theme }: { active: boolean; onClick: () => void; label: string; theme: 'dark' | 'light' }) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onClick}
      className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${
        active 
          ? (isDark ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'bg-white text-emerald-600 shadow-md border border-emerald-500/10') 
          : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700')
      }`}
    >
      <span className="uppercase text-[8px] md:text-[10px] tracking-widest">{label}</span>
    </button>
  );
}
