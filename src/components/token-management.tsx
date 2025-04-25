"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TokenManagementProps {
  players: string[];
  addToken: (player: string, tokenCount: number, reason: string, date: Date) => void;
  tokenReasonsList: { value: string; label: string; tokens: number }[];
}

export function TokenManagement({
  players,
  addToken,
  tokenReasonsList,
}: TokenManagementProps) {
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [tokenCount, setTokenCount] = useState("1");
  const [selectedReason, setSelectedReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlayer && selectedReason) {
      const reason = tokenReasonsList.find((r) => r.value === selectedReason)?.label as string;
      const tokensToAdd = parseInt(tokenCount);
      const now = new Date();
      addToken(selectedPlayer, tokensToAdd, reason, now);

      setSelectedReason("");
      setSelectedPlayer("");
      setTokenCount("1");
    } else {
      alert("Please select a player, a reason, and specify a token count.");
    }
  };

  return (
    <div className="bg-secondary/10 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">Token Management</h2>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <Label htmlFor="player">Player</Label>
          <Select onValueChange={setSelectedPlayer} value={selectedPlayer}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a player" />
            </SelectTrigger>
            <SelectContent>
              {players.map((player) => (
                <SelectItem key={player} value={player}>
                  {player}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="reason">Reason</Label>
          <Select onValueChange={setSelectedReason} value={selectedReason}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {tokenReasonsList.map((reason) => (
                <SelectItem key={reason.value} value={reason.value}>
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tokenCount">Token Count</Label>
          <Input
            type="number"
            id="tokenCount"
            value={tokenCount}
            onChange={(e) => setTokenCount(e.target.value)}
            // Remove the min attribute to allow negative numbers
          />
        </div>
        <Button type="submit">Add Token(s)</Button>
      </form>
    </div>
  );
}
