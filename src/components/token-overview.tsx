"use client";

import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TokenTimelineProps {
  tokenReasons: { player: string; reason: string; pool: "A" | "B", tokenCount: number, date: Date }[];
}

export function TokenTimeline({ tokenReasons }: TokenTimelineProps) {
  const playerTokenCounts: { [player: string]: number } = {};

  // Count tokens per player, considering both pools
  tokenReasons.forEach((token) => {
    if (token.player) {
      playerTokenCounts[token.player] = (playerTokenCounts[token.player] || 0) + token.tokenCount;
    }
  });

  return (
    <div className="bg-secondary/5 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Token Timeline</h2>
      {Object.keys(playerTokenCounts).length > 0 ? (
        <ul>
          {Object.entries(playerTokenCounts).map(([player, count], index) => {
            // Filter reasons for both pools
            const reasons = tokenReasons
              .filter((token) => token.player === player)
              .map((token) => ({
                reason: token.reason,
                tokenCount: token.tokenCount,
                date: token.date,
              }));

            const uniqueReasons = Array.from(new Set(reasons.map(r => r.reason)))
              .map(reason => {
                const tokenCount = reasons.find(r => r.reason === reason)?.tokenCount || 1;
                return `${reason} (${tokenCount} TK)`;
              });

            const formattedDate = reasons.length > 0 && reasons[0].date ? format(reasons[0].date, "dd.MM", { locale: de }) : "";

            return (
              <li key={index} className="py-1">
                {formattedDate} - {player} received tokens for: {uniqueReasons.join(", ")}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No tokens added yet.</p>
      )}
    </div>
  );
}

