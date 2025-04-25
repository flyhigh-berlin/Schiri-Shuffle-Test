"use client";

interface PoolDisplayProps {
  title: string;
  players: { name: string; tokens: number; disabled?: boolean }[];
  setPool: React.Dispatch<React.SetStateAction<{ name: string; tokens: number; disabled?: boolean }[]>>;
  totalTokens: number;
  calculatePercentage: (player: string, pool: "A" | "B") => string;
  firstReferee?: string | null;
}

export function PoolDisplay({ title, players, setPool, totalTokens, calculatePercentage, firstReferee }: PoolDisplayProps) {
  const enabledPlayers = players.filter(player => !player.disabled);
  const totalEnabledTokens = enabledPlayers.reduce((sum, player) => sum + player.tokens, 0);

  return (
    <div className="bg-secondary/20 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <ul>
        {players.map((player) => {
          const percentage = enabledPlayers.length > 0 ? ((player.tokens / totalEnabledTokens) * 100).toFixed(0) : '0';

          return (
            <li key={player.name} className={`flex justify-between items-center py-1 ${player.disabled ? 'text-gray-500 line-through' : ''}`}>
              <span>{player.name}</span>
              <span className="font-bold">
                {player.tokens} TK ({percentage}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

