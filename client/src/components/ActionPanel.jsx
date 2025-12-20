import React, { useState } from 'react';
import {
  GameController,
  Dice,
  ShoppingCart,
  XCircle,
  Handshake,
  ArrowRight,
  Key,
  CurrencyDollar,
  Timer,
  House,
  Buildings
} from '@phosphor-icons/react';
import { getSpaceById } from '../utils/boardData';
import { formatCurrency, getPhaseDisplay } from '../utils/formatters';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export default function ActionPanel({ socket, gameId, gameState, myPlayer, isMyTurn, onOpenTrade }) {
  const [loading, setLoading] = useState(false);

  if (!myPlayer) return null;

  const handleAction = async (action, data = {}) => {
    setLoading(true);
    try {
      await socket[action](gameId, ...Object.values(data));
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const currentSpace = getSpaceById(myPlayer.position);
  const canBuyProperty = () => {
    if (gameState.phase !== 'buying' || !isMyTurn) return false;
    const space = getSpaceById(myPlayer.position);
    if (!space || !space.price) return false;
    const property = gameState.properties[space.id];
    return !property.ownerId && myPlayer.cash >= space.price;
  };

  const canDeclineProperty = () => {
    return gameState.phase === 'buying' && isMyTurn;
  };

  const canRollDice = () => {
    // Can only roll if: it's rolling phase, my turn, not loading,
    // AND either haven't rolled yet OR can roll again (doubles)
    if (gameState.phase !== 'rolling' || !isMyTurn || loading) return false;
    return !gameState.hasRolledThisTurn || gameState.canRollAgain;
  };

  const canEndTurn = () => {
    return gameState.phase === 'rolling' && isMyTurn && !loading && gameState.hasRolledThisTurn;
  };

  const canPayJail = () => {
    return myPlayer.inJail && myPlayer.cash >= 50 && isMyTurn;
  };

  const canUseJailCard = () => {
    return myPlayer.inJail && myPlayer.getOutOfJailCards > 0 && isMyTurn;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <GameController size={18} className="text-primary" />
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 pt-0 space-y-4">
        {/* Phase Indicator */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2 text-sm">
            <Timer size={16} className="text-muted-foreground" />
            <span className="text-muted-foreground">Phase:</span>
            <Badge variant="outline" className="font-mono">
              {getPhaseDisplay(gameState.phase)}
            </Badge>
          </div>
        </div>

        {/* Turn Indicator */}
        {isMyTurn ? (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <GameController size={18} weight="fill" />
              Your Turn
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Timer size={16} />
              Waiting for {gameState.players[gameState.currentPlayerIndex]?.name}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Roll Dice */}
          {canRollDice() && (
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => handleAction('rollDice')}
              disabled={loading}
            >
              <Dice size={20} weight="fill" />
              Roll Dice
            </Button>
          )}

          {/* Jail Actions */}
          {myPlayer.inJail && isMyTurn && (
            <div className="space-y-2">
              {canPayJail() && (
                <Button
                  variant="warning"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => handleAction('payJailFee')}
                  disabled={loading}
                >
                  <CurrencyDollar size={20} />
                  Pay $50 to Exit Jail
                </Button>
              )}
              {canUseJailCard() && (
                <Button
                  variant="success"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => handleAction('useJailCard')}
                  disabled={loading}
                >
                  <Key size={20} />
                  Use Jail Card
                </Button>
              )}
            </div>
          )}

          {/* Buy Property */}
          {canBuyProperty() && (
            <Button
              variant="success"
              size="lg"
              className="w-full gap-2"
              onClick={() => handleAction('buyProperty', { propertyId: currentSpace.id })}
              disabled={loading}
            >
              <ShoppingCart size={20} />
              Buy {currentSpace.name} ({formatCurrency(currentSpace.price)})
            </Button>
          )}

          {/* Decline Property */}
          {canDeclineProperty() && (
            <Button
              variant="secondary"
              size="lg"
              className="w-full gap-2"
              onClick={() => handleAction('declareProperty')}
              disabled={loading}
            >
              <XCircle size={20} />
              Decline Purchase
            </Button>
          )}

          {/* Trade */}
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2"
            onClick={onOpenTrade}
            disabled={loading || myPlayer.isBankrupt}
          >
            <Handshake size={20} />
            Propose Trade
          </Button>

          {/* End Turn */}
          {canEndTurn() && (
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => handleAction('endTurn')}
              disabled={loading}
            >
              <ArrowRight size={20} />
              End Turn
            </Button>
          )}
        </div>

        {/* Available Buildings */}
        {!gameState.settings.unlimitedProperties && (
          <div className="mt-auto pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">Available Buildings</div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm">
                <House size={16} className="text-green-500" />
                <span className="font-mono">{gameState.availableHouses}</span>
                <span className="text-muted-foreground">Houses</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Buildings size={16} className="text-red-500" />
                <span className="font-mono">{gameState.availableHotels}</span>
                <span className="text-muted-foreground">Hotels</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
