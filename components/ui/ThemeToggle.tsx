'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const x = useMotionValue(0);

  // Transform x position to colors
  const background = useTransform(
    x,
    [-40, 0, 40],
    [
      'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', // Dark blue
      'linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%)', // Blue to teal
      'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', // Yellow/orange
    ]
  );

  const iconColor = useTransform(
    x,
    [-40, 0, 40],
    ['#60a5fa', '#14b8a6', '#fbbf24']
  );

  // Moon path (for dark mode)
  const moonPath = useTransform(x, [-40, -20], [1, 0]);
  
  // Sun rays (for light mode)
  const sunRays = useTransform(x, [20, 40], [0, 1]);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      x.set(-40);
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      x.set(40);
    }
  }, [x]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      x.set(-40);
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      x.set(40);
    }
  };

  return (
    <motion.button
      onClick={toggleTheme}
      style={{ background }}
      className="relative w-16 h-8 rounded-full shadow-lg overflow-hidden cursor-pointer border-2 border-white/20"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -40, right: 40 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x > 20) {
            toggleTheme();
          } else if (info.offset.x < -20) {
            toggleTheme();
          }
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
          {/* Moon (Dark mode) */}
          <motion.path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pathLength: moonPath, opacity: moonPath }}
          />
          
          {/* Sun (Light mode) */}
          <motion.g
            style={{ opacity: sunRays }}
          >
            <circle
              cx="12"
              cy="12"
              r="4"
              stroke={iconColor}
              strokeWidth="2"
              fill="none"
            />
            {/* Sun rays */}
            <motion.line
              x1="12"
              y1="1"
              x2="12"
              y2="3"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: sunRays }}
            />
            <motion.line
              x1="12"
              y1="21"
              x2="12"
              y2="23"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: sunRays }}
            />
            <motion.line
              x1="4.22"
              y1="4.22"
              x2="5.64"
              y2="5.64"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: sunRays }}
            />
            <motion.line
              x1="18.36"
              y1="18.36"
              x2="19.78"
              y2="19.78"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: sunRays }}
            />
            <motion.line
              x1="1"
              y1="12"
              x2="3"
              y2="12"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: sunRays }}
            />
            <motion.line
              x1="21"
              y1="12"
              x2="23"
              y2="12"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: sunRays }}
            />
            <motion.line
              x1="4.22"
              y1="19.78"
              x2="5.64"
              y2="18.36"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: sunRays }}
            />
            <motion.line
              x1="18.36"
              y1="5.64"
              x2="19.78"
              y2="4.22"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: sunRays }}
            />
          </motion.g>
        </svg>
      </motion.div>
    </motion.button>
  );
}
