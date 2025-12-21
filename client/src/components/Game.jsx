import React, { useState, useEffect } from 'react';
import {
  GameController,
  SignOut,
  X,
  CheckCircle,
  WarningCircle,
  Info,
  Trophy
} from '@phosphor-icons/react';
import Board2D from './Board2D';
import PlayerPanel from './PlayerPanel';
import ActionPanel from './ActionPanel';
import TradeModal from './TradeModal';
import AuctionModal from './AuctionModal';
import GameLog from './GameLog';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function Game({ socket, gameId, playerId, initialGameState, onExit }) {
  const [gameState, setGameState] = useState(initialGameState);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Listen for game updates
    const handleGameUpdate = (data) => {
      setGameState(data.gameState);
    };

    const handleDiceRolled = (data) => {
      setGameState(data.gameState);
      showNotification(`Dice rolled: ${data.result.dice.join(', ')}`);
    };

    const handlePropertyBought = (data) => {
      setGameState(data.gameState);
    };

    const handlePropertyDeclined = (data) => {
      setGameState(data.gameState);
    };

    const handleHouseBuilt = (data) => {
      setGameState(data.gameState);
    };

    const handleHotelBuilt = (data) => {
      setGameState(data.gameState);
    };

    const handlePropertyMortgaged = (data) => {
      setGameState(data.gameState);
    };

    const handlePropertyUnmortgaged = (data) => {
      setGameState(data.gameState);
    };

    const handleHouseSold = (data) => {
      setGameState(data.gameState);
    };

    const handleHotelSold = (data) => {
      setGameState(data.gameState);
    };

    const handleBidPlaced = (data) => {
      setGameState(data.gameState);
    };

    const handleAuctionEnded = (data) => {
      setGameState(data.gameState);
    };

    const handleTradeProposed = (data) => {
      setGameState(data.gameState);
    };

    const handleTradeCompleted = (data) => {
      setGameState(data.gameState);
      showNotification('Trade completed');
    };

    const handleTradeRejected = (data) => {
      setGameState(data.gameState);
      showNotification('Trade rejected');
    };

    const handleTurnEnded = (data) => {
      setGameState(data.gameState);
    };

    const handlePlayerLeft = (data) => {
      setGameState(data.gameState);
      showNotification('A player left the game');
    };

    const handleError = (data) => {
      showNotification(data.message, 'error');
    };

    // Register all listeners
    socket.on('gameUpdate', handleGameUpdate);
    socket.on('diceRolled', handleDiceRolled);
    socket.on('propertyBought', handlePropertyBought);
    socket.on('propertyDeclined', handlePropertyDeclined);
    socket.on('houseBuilt', handleHouseBuilt);
    socket.on('hotelBuilt', handleHotelBuilt);
    socket.on('propertyMortgaged', handlePropertyMortgaged);
    socket.on('propertyUnmortgaged', handlePropertyUnmortgaged);
    socket.on('houseSold', handleHouseSold);
    socket.on('hotelSold', handleHotelSold);
    socket.on('bidPlaced', handleBidPlaced);
    socket.on('auctionEnded', handleAuctionEnded);
    socket.on('tradeProposed', handleTradeProposed);
    socket.on('tradeCompleted', handleTradeCompleted);
    socket.on('tradeRejected', handleTradeRejected);
    socket.on('turnEnded', handleTurnEnded);
    socket.on('playerLeft', handlePlayerLeft);
    socket.on('error', handleError);

    // Cleanup listeners
    return () => {
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('diceRolled', handleDiceRolled);
      socket.off('propertyBought', handlePropertyBought);
      socket.off('propertyDeclined', handlePropertyDeclined);
      socket.off('houseBuilt', handleHouseBuilt);
      socket.off('hotelBuilt', handleHotelBuilt);
      socket.off('propertyMortgaged', handlePropertyMortgaged);
      socket.off('propertyUnmortgaged', handlePropertyUnmortgaged);
      socket.off('houseSold', handleHouseSold);
      socket.off('hotelSold', handleHotelSold);
      socket.off('bidPlaced', handleBidPlaced);
      socket.off('auctionEnded', handleAuctionEnded);
      socket.off('tradeProposed', handleTradeProposed);
      socket.off('tradeCompleted', handleTradeCompleted);
      socket.off('tradeRejected', handleTradeRejected);
      socket.off('turnEnded', handleTurnEnded);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('error', handleError);
    };
  }, [socket]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getCurrentPlayer = () => {
    return gameState.players[gameState.currentPlayerIndex];
  };

  const getMyPlayer = () => {
    return gameState.players.find(p => p.id === playerId);
  };

  const isMyTurn = () => {
    const currentPlayer = getCurrentPlayer();
    return currentPlayer && currentPlayer.id === playerId;
  };

  const handleRollDice = async () => {
    try {
      await socket.rollDice(gameId);
    } catch (err) {
      showNotification(err.message || 'Failed to roll dice', 'error');
    }
  };

  const canRollDice = () => {
    if (gameState.phase !== 'rolling' || !isMyTurn()) return false;
    return !gameState.hasRolledThisTurn || gameState.canRollAgain;
  };

  const handleLeaveGame = async () => {
    if (window.confirm('Are you sure you want to leave the game?')) {
      try {
        await socket.leaveGame(gameId);
        onExit();
      } catch (err) {
        console.error('Failed to leave game:', err);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'error':
        return <X size={18} weight="bold" />;
      case 'success':
        return <CheckCircle size={18} weight="fill" />;
      case 'warning':
        return <WarningCircle size={18} weight="fill" />;
      default:
        return <Info size={18} weight="fill" />;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'error':
        return 'bg-destructive/90 text-destructive-foreground border-destructive';
      case 'success':
        return 'bg-green-600/90 text-white border-green-500';
      case 'warning':
        return 'bg-amber-600/90 text-white border-amber-500';
      default:
        return 'bg-primary/90 text-primary-foreground border-primary';
    }
  };

  if (gameState.phase === 'ended') {
    const winner = gameState.players.find(p => !p.isBankrupt);
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <Trophy size={64} weight="duotone" className="text-primary" />
            </div>
            <CardTitle className="text-4xl">Game Over!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-primary">{winner?.name}</p>
              <p className="text-muted-foreground">wins the game!</p>
            </div>
            <Button size="lg" onClick={onExit} className="w-full gap-2">
              <GameController size={20} />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg ${getNotificationStyles(notification.type)}`}>
          {getNotificationIcon(notification.type)}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <GameController size={24} weight="duotone" className="text-primary" />
          <span className="text-xl font-bold text-primary tracking-wider">MONOPOLY</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground font-mono">
            Game: <span className="text-foreground font-bold">{gameId}</span>
          </span>
          <Button variant="secondary" size="sm" onClick={handleLeaveGame} className="gap-2">
            <SignOut size={18} />
            Leave
          </Button>
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Players & Log */}
        <aside className="w-96 flex-shrink-0 flex flex-col gap-2 p-2 bg-card/50 border-r border-border overflow-hidden">
          <PlayerPanel
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            myPlayerId={playerId}
            gameState={gameState}
          />
          <GameLog actionLog={gameState.actionLog || []} />
        </aside>

        {/* Center - Board */}
        <section className="flex-1 flex items-center justify-center p-2 overflow-hidden game-center">
          <Board2D
            gameState={gameState}
            onRollDice={handleRollDice}
            isMyTurn={isMyTurn()}
            canRoll={canRollDice()}
            myPlayerId={playerId}
            socket={socket}
            gameId={gameId}
          />
        </section>

        {/* Right Panel - Actions */}
        <aside className="w-96 flex-shrink-0 p-2 bg-card/50 border-l border-border overflow-auto">
          <ActionPanel
            socket={socket}
            gameId={gameId}
            gameState={gameState}
            myPlayer={getMyPlayer()}
            isMyTurn={isMyTurn()}
            onOpenTrade={() => setShowTradeModal(true)}
          />
        </aside>
      </main>

      {/* Trade Modal */}
      {showTradeModal && (
        <TradeModal
          socket={socket}
          gameId={gameId}
          gameState={gameState}
          myPlayer={getMyPlayer()}
          onClose={() => setShowTradeModal(false)}
        />
      )}

      {/* Auction Modal */}
      {gameState.auction && gameState.auction.active && (
        <AuctionModal
          socket={socket}
          gameId={gameId}
          auction={gameState.auction}
          myPlayer={getMyPlayer()}
          gameState={gameState}
        />
      )}
    </div>
  );
}
