
'use client';

import { useState, useCallback, useEffect } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Shuffle, Undo } from 'lucide-react';
import { PoolDisplay } from '@/components/pool-display';
import { TokenManagement } from '@/components/token-management';
import { TokenTimeline } from '@/components/token-overview';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PickerWheel } from '@/components/picker-wheel';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const playerImages = {
  Alice: 'https://picsum.photos/id/237/200/200',
  Bob: 'https://picsum.photos/id/238/200/200',
  Charlie: 'https://picsum.photos/id/239/200/200',
  David: 'https://picsum.photos/id/240/200/200',
  Eve: 'https://picsum.photos/id/241/200/200',
};

const players = Object.keys(playerImages).slice(0, 5);

const tokenReasonsList = [
  { value: 'delay_match_day', label: 'Delay on match day', tokens: 1 },
  { value: 'entire_car_late', label: 'Entire car late', tokens: 1 },
  { value: 'leave_early_arrive_late', label: 'Leave early/arrive late without prior agreement', tokens: 5 },
  { value: 'no_whistle', label: 'No Whistle', tokens: 1 },
  { value: 'no_feedback', label: 'No feedback (SP / WA)', tokens: 1 },
  { value: 'correction', label: 'Correction', tokens: 1 },
];

interface TokenReason {
  player: string;
  reason: string;
  pool: 'A' | 'B';
  tokenCount: number;
  date: Date;
}

export default function Home() {
  const [excludedPlayers, setExcludedPlayers] = useState<string[]>([]);
  const [poolA, setPoolA] = useState(
    players.map(player => ({ name: player, tokens: 1 }))
  );
  const [poolB, setPoolB] = useState(
    players.map(player => ({ name: player, tokens: 1 }))
  );
  const [tokenReasons, setTokenReasons] = useState<TokenReason[]>([]);

  const [referees, setReferees] = useState<{
    first: string | null;
    second: string | null;
  }>({ first: null, second: null });

  const [mustSpinA, setMustSpinA] = useState(false);
  const [winnerA, setWinnerA] = useState<string | null>(null);
  const [mustSpinB, setMustSpinB] = useState(false);
  const [winnerB, setWinnerB] = useState<string | null>(null);
  const [isShufflingA, setIsShufflingA] = useState(false);
  const [isShufflingB, setIsShufflingB] = useState(false);
  const { toast } = useToast();

  const [pickHistory, setPickHistory] = useState<
    {
      first: string | null;
      second: string | null;
      chanceA: number | null;
      chanceB: number | null;
    }[]
  >([]);


  const [shuffleCount, setShuffleCount] = useState(1);

  const [lastAction, setLastAction] = useState<any>(null);

  const canShuffle = pickHistory.length < players.length;

  const pickFinishedA = false;
  const pickFinishedB = false;

  const pickRefereeA = useCallback(async () => {
    setIsShufflingA(true);
    setWinnerA(null);

    const availablePlayersA = poolA.filter(player => player.tokens > 0 && !excludedPlayers.includes(player.name));
    if (availablePlayersA.length === 0) {
      toast({
        title: 'Error',
        description: 'Not enough players in Pool A.',
      });
      setIsShufflingA(false);
      return;
    }

    let totalTokensA = availablePlayersA.reduce(
      (sum, player) => sum + player.tokens,
      0
    );
    let weightedPlayersA = [];
    for (let player of availablePlayersA) {
      for (let i = 0; i < player.tokens; i++) {
        weightedPlayersA.push(player.name);
      }
    }

    const newWinnerA =
      weightedPlayersA[Math.floor(Math.random() * weightedPlayersA.length)];

    const firstReferee = poolA.find(player => player.name === newWinnerA);
    const chanceA =
      totalTokensA > 0 && firstReferee
        ? (firstReferee.tokens / totalTokensA) * 100
        : 0;

    setReferees(prev => ({ ...prev, first: newWinnerA }));

    setLastAction({
      type: 'pickRefereeA',
      winner: newWinnerA,
      poolA: poolA,
      poolB: poolB,
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    setPoolA(prevPool =>
      prevPool.map(player =>
        player.name === newWinnerA
          ? { ...player, tokens: player.tokens - 1 }
          : player
      )
    );
    setPickHistory(prevHistory => [...prevHistory, { first: newWinnerA, second: null, chanceA, chanceB: 0 }]);
    setWinnerA(newWinnerA);
    setMustSpinA(true);
    setIsShufflingA(false);
  }, [poolA, toast, excludedPlayers]);

  const pickRefereeB = useCallback(async () => {
    setIsShufflingB(true);
    setWinnerB(null);

    const availablePlayersB = poolB.filter(
      player => player.tokens > 0 && player.name !== referees.first && !excludedPlayers.includes(player.name)
    );

    if (availablePlayersB.length === 0) {
      toast({
        title: 'Error',
        description: 'Not enough players in Pool B.',
      });
      setIsShufflingB(false);
      return;
    }

    let totalTokensB = availablePlayersB.reduce(
      (sum, player) => sum + player.tokens,
      0
    );
    let weightedPlayersB = [];
    for (let player of availablePlayersB) {
      for (let i = 0; i < player.tokens; i++) {
        weightedPlayersB.push(player.name);
      }
    }

    const newWinnerB =
      weightedPlayersB[Math.floor(Math.random() * weightedPlayersB.length)];
    const secondReferee = poolB.find(player => player.name === newWinnerB);
    const chanceB = totalTokensB > 0 && secondReferee
      ? ((secondReferee.tokens / totalTokensB) * 100)
      : 0;

    setReferees(prev => ({ ...prev, second: newWinnerB }));
    setPickHistory(prevHistory => {
      const lastPick = prevHistory[prevHistory.length - 1];
      return prevHistory.slice(0, prevHistory.length - 1).concat([{ ...lastPick, second: newWinnerB, chanceB }]);
    });
    setWinnerB(newWinnerB);
    setMustSpinB(true);

        setLastAction({
          type: 'pickRefereeB',
          winner: newWinnerB,
          poolA: poolA,
          poolB: poolB,
        });

    await new Promise(resolve => setTimeout(resolve, 3000));

    setPoolB(prevPool =>
      prevPool.map(player =>
        player.name === newWinnerB
          ? { ...player, tokens: player.tokens - 1 }
          : player
      )
    );

    setIsShufflingB(false);
  }, [poolB, toast, referees.first, excludedPlayers]);

  const addToken = (player: string, tokenCount: number, reason: string, date: Date) => {
    const initialPoolA = [...poolA];
    const initialPoolB = [...poolB];
    setPoolA(prevPool =>
      prevPool.map(p =>
        p.name === player ? { ...p, tokens: p.tokens + tokenCount } : p
      )
    );
    setPoolB(prevPool =>
      prevPool.map(p =>
        p.name === player ? { ...p, tokens: p.tokens + tokenCount } : p
      )
    );

    setTokenReasons(prevReasons => [
      ...prevReasons,
      { player, reason, pool: 'A' as 'A', tokenCount, date },
      { player, reason, pool: 'B' as 'B', tokenCount, date },
    ]);

    setLastAction({
      type: 'addToken',
      player,
      tokenCount,
      reason,
      initialPoolA,
      initialPoolB,
    });
  };

  const onFinishedA = useCallback(() => {
    setMustSpinA(false);
  }, []);

  const onFinishedB = useCallback(() => {
    setMustSpinB(false);
  }, []);

  const handleUndo = () => {
    if (lastAction) {
      switch (lastAction.type) {
        case 'addToken':
          setPoolA(lastAction.initialPoolA);
          setPoolB(lastAction.initialPoolB);
          setTokenReasons(prevReasons => {
            return prevReasons.filter(
              reason =>
                !(
                  reason.player === lastAction.player &&
                  reason.reason === lastAction.reason
                )
            );
          });
          break;
        case 'pickRefereeA':
          setPoolA(lastAction.poolA);
          setPoolB(lastAction.poolB);
          setReferees(prev => ({ ...prev, first: null, second: null }));
          setPickHistory(prevHistory => prevHistory.slice(0, -1));
          break;
        case 'pickRefereeB':
          setPoolA(lastAction.poolA);
          setPoolB(lastAction.poolB);
          setReferees(prev => ({ ...prev, second: null }));
          setPickHistory(prevHistory => prevHistory.slice(0, -1));
          break;
        default:
          console.warn('Unknown action type:', lastAction.type);
      }
      setLastAction(null);
    }
  };

  const handleReset = () => {
    setPoolA(players.map(player => ({ name: player, tokens: 1 })));
    setPoolB(players.map(player => ({ name: player, tokens: 1 })));
    setTokenReasons([]);
    setReferees({ first: null, second: null });
    setMustSpinA(false);
    setWinnerA(null);
    setMustSpinB(false);
    setWinnerB(null);
    setIsShufflingA(false);
    setIsShufflingB(false);
    setPickHistory([]);
    setLastAction(null);
    setExcludedPlayers([]);
  };


  useEffect(() => {
    setPickHistory([]);
  }, []);

  const toggleExcludePlayer = (player: string) => {
    setExcludedPlayers(prev => {
      if (prev.includes(player)) {
        return prev.filter(p => p !== player);
      } else {
        return [...prev, player];
      }
    });
  };

   const getFilteredPool = (pool: { name: string; tokens: number }[]) => {
    return pool.filter(player => !excludedPlayers.includes(player.name));
  };

  const filteredPoolA = getFilteredPool(poolA);
  const filteredPoolB = getFilteredPool(poolB);


  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Schiri Shuffle</SidebarGroupLabel>
              <SidebarSeparator />
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Pools</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Token Management</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>Token Timeline</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            <SidebarSeparator />
          </SidebarContent>
          <SidebarFooter>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={handleUndo}
                disabled={!lastAction}
              >
                <Undo className="mr-2 h-4 w-4" />
                Undo Last Shuffle
              </Button>
              <Button variant="destructive" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-4">
           <h1 className="text-2xl font-bold mb-4">
            Schiri Shuffle #{shuffleCount}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <PoolDisplay
              title="Pool A (1. Schiri)"
              players={filteredPoolA}
              setPool={setPoolA}
              totalTokens={poolA.reduce((sum, player) => sum + player.tokens, 0)}
            />
            <PoolDisplay
              title="Pool B (2. Schiri)"
              players={filteredPoolB}
              setPool={setPoolB}
              totalTokens={poolB.reduce((sum, player) => sum + player.tokens, 0)}
              firstReferee={referees.first}
            />
          </div>

          <div className="mb-2">
            <h2 className="text-md font-semibold">Exclude Players:</h2>
            <div className="flex gap-4">
              {players.map(player => (
                <div key={player} className="flex items-center space-x-2">
                  <Checkbox
                    id={`exclude-pools-${player}`}
                    checked={excludedPlayers.includes(player)}
                    onCheckedChange={() => toggleExcludePlayer(player)}
                  />
                  <Label htmlFor={`exclude-pools-${player}`} className="text-sm">{player}</Label>
                </div>
              ))}
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Pool A Picker Wheel:</h2>
              <PickerWheel
                players={filteredPoolA
                  .filter(player => player.tokens > 0)
                  .map(p => p.name)}
                mustSpin={mustSpinA}
                winner={winnerA}
                onFinished={onFinishedA}
                handleSpin={pickRefereeA}
                isShuffling={isShufflingA}
                setMustSpin={setMustSpinA}
              />
              <Button
                variant="outline"
                onClick={pickRefereeA}
                disabled={isShufflingA}
              >
                Pick 1. Schiri
              </Button>
              {winnerA && (
                <p>
                  1. Schiri: {winnerA} (
                  {pickHistory.slice(-1)[0]?.chanceA?.toFixed(0)}%)
                </p>
              )}
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold">Pool B Picker Wheel:</h2>
              <PickerWheel
                players={filteredPoolB
                  .filter(player => player.tokens > 0 && player.name !== referees.first)
                  .map(p => p.name)}
                mustSpin={mustSpinB}
                winner={winnerB}
                onFinished={onFinishedB}
                handleSpin={pickRefereeB}
                isShuffling={isShufflingB}
                setMustSpin={setMustSpinB}
              />
              <Button
                variant="outline"
                onClick={pickRefereeB}
                disabled={isShufflingB || referees.first === null}
              >
                Pick 2. Schiri
              </Button>
              {winnerB && (
                <p>
                  2. Schiri: {winnerB} (
                  {pickHistory.slice(-1)[0]?.chanceB?.toFixed(0)}%)
                </p>
              )}
            </div>
          </div>

          <TokenManagement
            players={players}
            addToken={addToken}
            tokenReasonsList={tokenReasonsList}
          />
          <div className='mb-4' />
          <TokenTimeline tokenReasons={tokenReasons} />
          <div className='mb-4' />
          <div className="bg-secondary/5 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Pick History</h2>
            <ScrollArea className="h-40 rounded-md">
              <ul>
                {pickHistory.map((pick, index) => (
                  <li key={index} className="py-1">
                     Spieltag #{index + 1}: 1. Schiri: {pick.first || 'N/A'} (
                    {pick.chanceA ? pick.chanceA.toFixed(0) : '0'}%), 2. Schiri:{' '}
                    {pick.second || 'N/A'} ({pick.chanceB ? pick.chanceB.toFixed(0) : '0'}%)
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
          <div className='mb-4' />
        </main>
      </div>
    </SidebarProvider>
  );
}


