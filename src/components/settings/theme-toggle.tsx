"use client";

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = storedTheme === 'dark' || (storedTheme === null && prefersDark);
    setIsDarkMode(initialDarkMode);
    document.documentElement.classList.toggle('dark', initialDarkMode);
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', checked);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
        <Label htmlFor="theme-switch" className="flex items-center gap-2">
            {isDarkMode ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5" />}
            <span className="font-medium">
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </span>
        </Label>
        <Switch
            id="theme-switch"
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            aria-label="Toggle dark mode"
        />
    </div>
  );
}
