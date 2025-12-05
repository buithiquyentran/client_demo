"use client";

import React, { useEffect, useState } from "react";

interface ProgressBarProps {
  isLoading: boolean;
  progress?: number; // 0-100, optional for indeterminate mode
}

/**
 * Modern top progress bar for API calls
 * - Smooth animations
 * - Auto-progress simulation when progress not provided
 * - Sticks to top of viewport
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  isLoading,
  progress,
}) => {
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      // Complete animation when done
      setCurrentProgress(100);
      const timer = setTimeout(() => setCurrentProgress(0), 400);
      return () => clearTimeout(timer);
    }

    if (progress !== undefined) {
      // Use provided progress
      setCurrentProgress(progress);
    } else {
      // Auto-simulate progress (asymptotic approach to 90%)
      setCurrentProgress(0);
      const interval = setInterval(() => {
        setCurrentProgress((prev) => {
          if (prev >= 90) return prev;
          // Slower as it approaches 90%
          const increment = (90 - prev) * 0.15;
          return Math.min(prev + increment, 90);
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isLoading, progress]);

  if (!isLoading && currentProgress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-lg transition-all duration-300 ease-out"
        style={{ width: `${currentProgress}%` }}
      >
        {/* Glowing effect */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/40 to-transparent" />
      </div>
    </div>
  );
};

export default ProgressBar;
