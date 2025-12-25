import React from 'react';
import {
  Users,
  CurrencyDollar,
  Buildings
} from '@phosphor-icons/react';
import { formatCurrency } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export default function PlayerPanel({ players, currentPlayerIndex, myPlayerId, onPlayerClick }) {
  return (
    <Card className="flex-shrink-0 card-gilded">
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users size={18} className="text-primary" weight="duotone" />
          Players
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-0 space-y-1">
        {players.map((player, index) => {
          const isCurrentPlayer = index === currentPlayerIndex;
          const isMe = player.id === myPlayerId;
          const isBankrupt = player.isBankrupt;

          return (
            <div
              key={player.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer hover:bg-secondary/50 ${
                isCurrentPlayer && !isBankrupt
                  ? 'bg-primary/15 ring-1 ring-primary/50'
                  : isBankrupt
                  ? 'bg-muted/20 opacity-50'
                  : 'bg-secondary/30'
              }`}
              onClick={() => onPlayerClick?.(player.id)}
            >
              {/* Color dot */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: player.color }}
              />

              {/* Name */}
              <span className={`flex-1 text-sm font-medium truncate ${isBankrupt ? 'line-through text-muted-foreground' : ''}`}>
                {player.name}
              </span>

              {/* You badge */}
              {isMe && (
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4">YOU</Badge>
              )}

              {/* Money */}
              <div className="flex items-center gap-1 text-xs">
                <CurrencyDollar size={12} className="text-primary" weight="bold" />
                <span className={`font-mono font-semibold ${isBankrupt ? 'text-muted-foreground' : 'text-primary'}`}>
                  {formatCurrency(player.cash)}
                </span>
              </div>

              {/* Property count */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Buildings size={12} />
                <span>{player.properties?.length || 0}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
