/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Habit {
  id: number;
  goal: string;
  type: string;
  name: string;
  color: string;
  notes: string | null;
  unit: string | null;
  target: number | null;
  targetType: string | null;
  isPrivate: number;
  frequency: string | null;
  frequencyNumber: number | null;
  notifications: number;
  notificationTime: string | null;
  notificationQuestion: string | null;
  createdAt: string;
  updatedAt: string;
  archived: number;
  emoji?: string;
}

export interface Entry {
  id: number;
  habitId: number;
  value: number;
  valueType?: string;
  date: string;
  note?: string | null;
}

export interface HabitData {
  habits: Habit[];
  entries: Entry[];
}

export type TimeRange = 'month' | 'year' | 'fiftyYears';
