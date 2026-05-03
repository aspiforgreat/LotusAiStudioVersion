import rawData from './data.json';
import { HabitData, Habit, Entry } from './types';

const colorMap: Record<string, string> = {
  "pink": "#f472b6",
  "teal": "#2dd4bf",
  "cyan": "#22d3ee",
  "red": "#f87171",
  "orange": "#fb923c",
  "blue": "#60a5fa",
  "yellow": "#fbbf24",
  "green": "#4ade80",
  "purple": "#a78bfa",
};

// Helper to map raw data to app types
export const mapRawData = (raw: any): HabitData => {
  const habits: Habit[] = (raw.habits || []).map((h: any) => {
    // Extract emoji from name if present at the start
    const emojiMatch = h.name.match(/^(\p{Regional_Indicator}{2}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
    let emoji = emojiMatch ? emojiMatch[0] : '';
    
    if (!emoji && h.name.length > 0) {
      const broadMatch = h.name.match(/^(\p{Emoji})/u);
      if (broadMatch) {
        emoji = broadMatch[0];
      }
    }

    const cleanName = emoji ? h.name.replace(emoji, '').trim() : h.name;

    return {
      ...h,
      name: cleanName,
      emoji: emoji || '✨',
      color: colorMap[h.color] || h.color
    };
  });

  const entries: Entry[] = (raw.entries || []).map((e: any) => ({
    ...e,
    habitId: Number(e.habitId)
  }));

  return { habits, entries };
};

export const SAMPLE_DATA: HabitData = mapRawData(rawData);

export const EMPTY_DATA: HabitData = {
  habits: [],
  entries: []
};

export const HABIT_DATA: HabitData = EMPTY_DATA;
