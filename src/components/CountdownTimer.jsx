import React, { useState, useEffect } from "react";
import { parseLaunchDate, hasLaunchOccurred } from "../utils/dateUtils";

const CountdownTimer = ({ launchDate, launchStatus }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [hasLaunched, setHasLaunched] = useState(
    // Only show "Launch has occurred" if explicitly marked as launched in the status
    launchStatus === "success" ||
      launchStatus === "failure" ||
      launchStatus === "completed"
  );

  function calculateTimeLeft() {
    const targetDate = parseLaunchDate(launchDate);
    const now = new Date();
    const difference = targetDate - now;

    // Debug
    console.log("Launch date:", targetDate);
    console.log("Current date:", now);
    console.log("Time difference (ms):", difference);

    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else if (difference <= 0 && !hasLaunched) {
      // Only if we haven't already marked it as launched
      if (
        launchStatus === "go" ||
        launchStatus === "success" ||
        launchStatus === "failure" ||
        launchStatus === "completed"
      ) {
        setHasLaunched(true);
      }
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate, launchStatus]);

  // Update hasLaunched when launchStatus changes
  useEffect(() => {
    if (
      launchStatus === "success" ||
      launchStatus === "failure" ||
      launchStatus === "completed"
    ) {
      setHasLaunched(true);
    } else {
      // Recalculate based on time
      const targetDate = new Date(launchDate);
      const now = new Date();
      setHasLaunched(
        now > targetDate &&
          (launchStatus === "go" || launchStatus === "in flight")
      );
    }
  }, [launchStatus, launchDate]);

  if (hasLaunched) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/20 border-2 border-red-500">
          <span className="animate-pulse mr-2 h-3 w-3 rounded-full bg-red-500"></span>
          <span className="text-red-500 font-bold">Launch has occurred!</span>
        </div>
      </div>
    );
  }

  if (Object.keys(timeLeft).length === 0) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500/20 border-2 border-yellow-500">
          <span className="text-yellow-300 font-bold">Launch Imminent</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-3">
      <h3 className="text-base sm:text-lg font-semibold text-cosmos-200">
        Time Until Launch
      </h3>
      <div className="grid grid-cols-4 gap-1 sm:gap-3">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div
            key={unit}
            className="flex flex-col items-center p-1 sm:p-3 rounded-lg bg-space-800/60 border border-space-600">
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-white countdown-digit">
              {value.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs text-cosmos-200 uppercase tracking-wider countdown-label">
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
