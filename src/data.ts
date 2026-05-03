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

// Map the raw data to the application's types
const habits: Habit[] = rawData.habits.map((h: any) => {
  // Extract emoji from name if present at the start
  // This regex handles flag emojis (Regional Indicators), presentation emojis, and emojis with modifiers
  const emojiMatch = h.name.match(/^(\p{Regional_Indicator}{2}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
  let emoji = emojiMatch ? emojiMatch[0] : '';
  
  // If no match found but first "point" is an emoji according to broad definition
  if (!emoji && h.name.length > 0) {
    // Check for standard emojis that might not be caught by Emoji_Presentation
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
    color: colorMap[h.color] || h.color // Use hex code from map or fallback to original
  };
});

const entries: Entry[] = rawData.entries.map((e: any) => ({
  ...e,
  habitId: Number(e.habitId)
}));

export const HABIT_DATA: HabitData = {
  habits,
  entries
};
