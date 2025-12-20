import React from 'react';
import {
  Users,
  CurrencyDollar,
  Key,
  House,
  Buildings,
  Warning,
  Timer
} from '@phosphor-icons/react';
import { formatCurrency } from '../utils/formatters';
import { getSpaceById, COLOR_MAP } from '../utils/boardData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export default function PlayerPanel({ players, currentPlayerIndex, myPlayerId, gameState }) {
  const getPropertyColor = (space) => {
    if (space.type === 'property' && space.color) {
      return COLOR_MAP[space.color] || '#888';
    }
    if (space.type === 'railroad') return '#444';
    if (space.type === 'utility') return '#888';
    return '#666';
  };

  return (
    <Card className="flex-shrink-0 max-h-[50%] flex flex-col">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Users size={18} className="text-primary" />
          Players
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2 pt-0 space-y-2">
        {players.map((player, index) => {
          const isCurrentPlayer = index === currentPlayerIndex;
          const isMe = player.id === myPlayerId;
          const isBankrupt = player.isBankrupt;

          return (
            <div
              key={player.id}
              className={`p-3 rounded-lg border transition-colors ${
                isCurrentPlayer && !isBankrupt
                  ? 'bg-primary/10 border-primary/50'
                  : isBankrupt
                  ? 'bg-muted/30 border-border opacity-60'
                  : isMe
                  ? 'bg-secondary/50 border-border'
                  : 'bg-card border-border'
              }`}
            >
              {/* Player Header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full ring-2 ring-background shadow-sm"
                  style={{ backgroundColor: player.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-semibold text-sm truncate ${isBankrupt ? 'line-through text-muted-foreground' : ''}`}>
                      {player.name}
                    </span>
                    {isMe && (
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">YOU</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Cash */}
              <div className="flex items-center gap-1.5 text-sm mb-2">
                <CurrencyDollar size={14} className="text-primary" />
                <span className={`font-mono font-bold ${isBankrupt ? 'text-muted-foreground' : 'text-primary'}`}>
                  {formatCurrency(player.cash)}
                </span>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {player.inJail && (
                  <Badge variant="destructive" className="text-[10px] py-0 gap-1">
                    <Timer size={10} />
                    Jail ({3 - player.jailTurns} turns)
                  </Badge>
                )}
                {player.getOutOfJailCards > 0 && (
                  <Badge variant="secondary" className="text-[10px] py-0 gap-1">
                    <Key size={10} />
                    {player.getOutOfJailCards} Jail Card{player.getOutOfJailCards > 1 ? 's' : ''}
                  </Badge>
                )}
                {isBankrupt && (
                  <Badge variant="destructive" className="text-[10px] py-0 gap-1">
                    <Warning size={10} />
                    Bankrupt
                  </Badge>
                )}
              </div>

              {/* Properties */}
              {player.properties.length > 0 && gameState && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    <Buildings size={12} />
                    <span>Properties ({player.properties.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {player.properties.map(propId => {
                      const space = getSpaceById(propId);
                      const prop = gameState.properties[propId];
                      if (!space || !prop) return null;
                      return (
                        <div
                          key={propId}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-secondary/50 ${
                            prop.mortgaged ? 'opacity-50' : ''
                          }`}
                          style={{
                            borderLeft: `3px solid ${getPropertyColor(space)}`
                          }}
                          title={`${space.name}${prop.houses > 0 ? ` (${prop.houses}H)` : ''}${prop.hotels > 0 ? ' (Hotel)' : ''}${prop.mortgaged ? ' [Mortgaged]' : ''}`}
                        >
                          <span className="truncate max-w-[60px]">{space.name}</span>
                          {prop.houses > 0 && (
                            <span className="text-green-500 flex items-center gap-0.5">
                              <House size={8} weight="fill" />
                              {prop.houses}
                            </span>
                          )}
                          {prop.hotels > 0 && (
                            <span className="text-red-500">
                              <Buildings size={8} weight="fill" />
                            </span>
                          )}
                          {prop.mortgaged && (
                            <span className="text-destructive text-[8px] font-bold">M</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {player.properties.length === 0 && !isBankrupt && (
                <div className="text-xs text-muted-foreground italic mt-1">
                  No properties
                </div>
              )}

              {/* Current Turn Indicator */}
              {isCurrentPlayer && !isBankrupt && (
                <div className="mt-2 pt-2 border-t border-primary/30">
                  <Badge variant="default" className="text-[10px] w-full justify-center">
                    Current Turn
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
