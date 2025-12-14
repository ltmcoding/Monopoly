import React, { useState, useEffect } from 'react';
import Board2D from './Board2D';
import PlayerPanel from './PlayerPanel';
import ActionPanel from './ActionPanel';
import PropertyCard from './PropertyCard';
import TradeModal from './TradeModal';
import AuctionModal from './AuctionModal';
import GameLog from './GameLog';

export default function Game({ socket, gameId, playerId, initialGameState, onExit }) {
  const [gameState, setGameState] = useState(initialGameState);
  const [selectedProperty, setSelectedProperty] = useState(null);
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

  const handlePropertyClick = (propertyId) => {
    setSelectedProperty(propertyId);
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

  if (gameState.phase === 'ended') {
    const winner = gameState.players.find(p => !p.isBankrupt);
    return (
      <div className="game-over-container">
        <div className="game-over-card">
          <h1>Game Over!</h1>
          <h2>{winner?.name} wins!</h2>
          <button className="btn btn-primary" onClick={onExit}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="game-header">
        <div className="game-title-small">MONOPOLY</div>
        <div className="game-code-small">Game: {gameId}</div>
        <button className="btn btn-small btn-secondary" onClick={handleLeaveGame}>
          Leave
        </button>
      </div>

      <div className="game-main">
        <div className="game-left">
          <PlayerPanel
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            myPlayerId={playerId}
          />
          <GameLog actionLog={gameState.actionLog || []} />
        </div>

        <div className="game-center">
          <Board2D
            gameState={gameState}
            onPropertyClick={handlePropertyClick}
          />
        </div>

        <div className="game-right">
          <ActionPanel
            socket={socket}
            gameId={gameId}
            gameState={gameState}
            myPlayer={getMyPlayer()}
            isMyTurn={isMyTurn()}
            onOpenTrade={() => setShowTradeModal(true)}
          />
        </div>
      </div>

      {selectedProperty !== null && (
        <PropertyCard
          propertyId={selectedProperty}
          gameState={gameState}
          myPlayer={getMyPlayer()}
          isMyTurn={isMyTurn()}
          gameId={gameId}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {showTradeModal && (
        <TradeModal
          socket={socket}
          gameId={gameId}
          gameState={gameState}
          myPlayer={getMyPlayer()}
          onClose={() => setShowTradeModal(false)}
        />
      )}

      {gameState.auction && gameState.auction.active && (
        <AuctionModal
          socket={socket}
          gameId={gameId}
          auction={gameState.auction}
          myPlayer={getMyPlayer()}
        />
      )}
    </div>
  );
}
