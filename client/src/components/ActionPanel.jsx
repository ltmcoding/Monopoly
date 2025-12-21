import React, { useState } from 'react';
import {
  GameController,
  DiceFive,
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
    <Card className="h-full flex flex-col card-gilded">
      <CardHeader className="py-4 px-5">
        <CardTitle className="text-base flex items-center gap-2.5">
          <GameController size={22} className="text-primary" weight="duotone" />
          Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 pt-0 space-y-5">
        {/* Phase Indicator */}
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2.5 text-base">
            <Timer size={20} className="text-muted-foreground" />
            <span className="text-muted-foreground">Phase:</span>
            <Badge variant="outline" className="font-mono text-sm py-0.5 px-2">
              {getPhaseDisplay(gameState.phase)}
            </Badge>
          </div>
        </div>

        {/* Turn Indicator */}
        {isMyTurn ? (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center gap-2.5 text-base font-semibold text-primary">
              <GameController size={22} weight="fill" />
              Your Turn
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2.5 text-base text-muted-foreground">
              <Timer size={20} />
              Waiting for {gameState.players[gameState.currentPlayerIndex]?.name}
            </div>
          </div>
        )}

        {/* Gold Divider */}
        <div className="divider-gilded" />

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Roll Dice */}
          {canRollDice() && (
            <Button
              size="xl"
              className="w-full gap-2.5 text-base"
              onClick={() => handleAction('rollDice')}
              disabled={loading}
            >
              <DiceFive size={24} weight="fill" />
              Roll Dice
            </Button>
          )}

          {/* Jail Actions */}
          {myPlayer.inJail && isMyTurn && (
            <div className="space-y-3">
              {canPayJail() && (
                <Button
                  variant="warning"
                  size="xl"
                  className="w-full gap-2.5 text-base"
                  onClick={() => handleAction('payJailFee')}
                  disabled={loading}
                >
                  <CurrencyDollar size={24} />
                  Pay $50 to Exit Jail
                </Button>
              )}
              {canUseJailCard() && (
                <Button
                  variant="success"
                  size="xl"
                  className="w-full gap-2.5 text-base"
                  onClick={() => handleAction('useJailCard')}
                  disabled={loading}
                >
                  <Key size={24} />
                  Use Jail Card
                </Button>
              )}
            </div>
          )}

          {/* Buy Property */}
          {canBuyProperty() && (
            <Button
              variant="success"
              size="xl"
              className="w-full gap-2.5 text-base"
              onClick={() => handleAction('buyProperty', { propertyId: currentSpace.id })}
              disabled={loading}
            >
              <ShoppingCart size={24} />
              Buy {currentSpace.name} ({formatCurrency(currentSpace.price)})
            </Button>
          )}

          {/* Decline Property */}
          {canDeclineProperty() && (
            <Button
              variant="secondary"
              size="xl"
              className="w-full gap-2.5 text-base"
              onClick={() => handleAction('declareProperty')}
              disabled={loading}
            >
              <XCircle size={24} />
              Decline Purchase
            </Button>
          )}

          {/* Trade */}
          <Button
            variant="outline"
            size="xl"
            className="w-full gap-2.5 text-base"
            onClick={onOpenTrade}
            disabled={loading || myPlayer.isBankrupt}
          >
            <Handshake size={24} />
            Propose Trade
          </Button>

          {/* End Turn */}
          {canEndTurn() && (
            <Button
              size="xl"
              className="w-full gap-2.5 text-base"
              onClick={() => handleAction('endTurn')}
              disabled={loading}
            >
              <ArrowRight size={24} />
              End Turn
            </Button>
          )}
        </div>

        {/* Available Buildings */}
        {!gameState.settings.unlimitedProperties && (
          <div className="mt-auto pt-5">
            {/* Gold Divider */}
            <div className="divider-gilded mb-4" />
            <div className="text-sm text-muted-foreground mb-3">Available Buildings</div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2.5 text-base">
                <House size={20} className="text-green-500" />
                <span className="font-mono font-bold">{gameState.availableHouses}</span>
                <span className="text-muted-foreground">Houses</span>
              </div>
              <div className="flex items-center gap-2.5 text-base">
                <Buildings size={20} className="text-red-500" />
                <span className="font-mono font-bold">{gameState.availableHotels}</span>
                <span className="text-muted-foreground">Hotels</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
