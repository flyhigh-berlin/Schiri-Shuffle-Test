"use client";

import React, { useState, useRef, useEffect } from 'react';

interface PickerWheelProps {
  players: string[];
  mustSpin: boolean;
  winner: string | null;
  onFinished: () => void;
  handleSpin: () => void;
  isShuffling: boolean;
  setMustSpin: (mustSpin: boolean) => void;
}

const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};

const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  }
  return `#${f(0)}${f(8)}${f(4)}`;
}

const generateStableColors = (items: string[]) => {
  const colors: string[] = [];

  items.forEach((item) => {
    const hash = hashCode(item);
    const hue = Math.abs(hash % 360);
    colors.push(hslToHex(hue, 50, 60));
  });
  return colors;
};

export function PickerWheel({
  players,
  mustSpin,
  winner,
  onFinished,
  handleSpin,
  isShuffling,
  setMustSpin,
}: PickerWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [sectorStyles, setSectorStyles] = useState<React.CSSProperties[]>([]);
  const [sectorColors, setSectorColors] = useState<string[]>([]);

  useEffect(() => {
    if (players.length > 0) {
      const generatedColors = generateStableColors(players);
      setSectorColors(generatedColors);
    }
  }, [players]);

  useEffect(() => {
    const generateSectorStyles = (numSectors: number) => {
      const angle = 360 / numSectors;
      let rotate = 0;
      const sectorStyles: React.CSSProperties[] = [];

      for (let i = 0; i < numSectors; i++) {
        sectorStyles.push({
          transform: `rotate(${rotate}deg)`,
          backgroundColor: sectorColors[i],
        });
        rotate += angle;
      }

      return sectorStyles;
    };

    if (players.length > 0 && sectorColors.length > 0) {
      setSectorStyles(generateSectorStyles(players.length));
    }
  }, [players, sectorColors]);

  useEffect(() => {
    if (mustSpin && wheelRef.current) {
      const animationDuration = 3; // seconds
      const extraSpins = 5; // defines how many extra spins the wheel will do
      const chosenIndex = players.indexOf(winner || "");
      const numSectors = players.length;
      const angle = 360 / numSectors;
      const rotateDegrees =
        360 * extraSpins + angle / 2 + chosenIndex * angle - 360 / 4;

      wheelRef.current.style.transition = `transform ${animationDuration}s cubic-bezier(0.23, 1, 0.320, 1)`;
      wheelRef.current.style.transform = `rotate(${rotateDegrees}deg)`;

      const timeoutId = setTimeout(() => {
        wheelRef.current!.style.transition = "none";
        wheelRef.current!.style.transform = `rotate(${
          rotateDegrees % 360
        }deg)`;
        onFinished();
      }, animationDuration * 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [mustSpin, winner, onFinished, players]);

  return (
    <div className="relative w-64 h-64 rounded-full overflow-hidden">
      <div
        ref={wheelRef}
        className="wheel absolute top-0 left-0 w-full h-full transition-transform duration-300"
      >
        {players.length > 0 ? (
          players.map((player, index) => {
            const rotate = `rotate(${index * (360 / players.length)}deg)`;
            const skew = `skewY(${90 - 360 / players.length}deg)`;
            return (
              <div
                key={index}
                className="sector absolute top-0 left-0 w-1/2 h-full origin-top-right overflow-hidden flex items-center justify-center text-black"
                style={{
                  transform: rotate + " " + skew,
                  backgroundColor: sectorStyles[index]?.backgroundColor,
                }}
              >
                <div
                  className="relative w-full h-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    transform: `skewY(${-90 + 360 / players.length}deg) rotate(180deg)`,
                  }}
                >
                  {player}
                </div>
              </div>
            );
          })
        ) : (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            No players available.
          </div>
        )}
      </div>
      <div className="arrow absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-8 border-solid border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent z-10"></div>
    </div>
  );
}

