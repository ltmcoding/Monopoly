import React, { useState, useEffect, useRef } from 'react';
import {
  GameController,
  SignOut,
  X,
  CheckCircle,
  WarningCircle,
  Info,
  Trophy,
  Handshake,
  Buildings,
  CaretRight,
  CurrencyDollar,
  Key,
  Check,
  House as HouseIcon,
  Gear,
  Users
} from '@phosphor-icons/react';
import Board2D from './Board2D';
import PlayerPanel from './PlayerPanel';
import TradeModal from './TradeModal';
import AuctionModal from './AuctionModal';
import GameLog from './GameLog';
import { getSpaceById, COLOR_MAP } from '../utils/boardData';
import { formatCurrency } from '../utils/formatters';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export default function Game({ socket, gameId, playerId, initialGameState, onExit }) {
  const [gameState, setGameState] = useState(initialGameState);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [selectedColorSet, setSelectedColorSet] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const propertyRefs = useRef({});

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

  // Handle trade actions
  const handleAcceptTrade = async (tradeId) => {
    setTradeLoading(true);
    try {
      await socket.acceptTrade(gameId, tradeId);
      setSelectedTrade(null);
      showNotification('Trade accepted!', 'success');
    } catch (err) {
      showNotification(err.message || 'Failed to accept trade', 'error');
    } finally {
      setTradeLoading(false);
    }
  };

  const handleRejectTrade = async (tradeId) => {
    setTradeLoading(true);
    try {
      await socket.rejectTrade(gameId, tradeId);
      setSelectedTrade(null);
      showNotification('Trade rejected', 'info');
    } catch (err) {
      showNotification(err.message || 'Failed to reject trade', 'error');
    } finally {
      setTradeLoading(false);
    }
  };

  // Render pending trades section
  const renderPendingTrades = () => {
    const myPlayer = getMyPlayer();
    if (!myPlayer) return null;

    // Get trades where I'm involved (either sender or receiver)
    const pendingTrades = gameState.trades?.filter(
      t => t.status === 'pending' && (t.toPlayerId === myPlayer.id || t.fromPlayerId === myPlayer.id)
    ) || [];

    if (pendingTrades.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No pending trades
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {pendingTrades.map(trade => {
          const fromPlayer = gameState.players.find(p => p.id === trade.fromPlayerId);
          const toPlayer = gameState.players.find(p => p.id === trade.toPlayerId);
          const isIncoming = trade.toPlayerId === myPlayer.id;

          return (
            <div
              key={trade.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-secondary/50 ${
                isIncoming ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-secondary/30'
              }`}
              onClick={() => setSelectedTrade(trade)}
            >
              <div className="flex items-center gap-2 mb-1">
                {isIncoming ? (
                  <>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fromPlayer?.color }} />
                    <span className="font-medium text-sm">{fromPlayer?.name}</span>
                    <CaretRight size={12} className="text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">You</span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground text-sm">You</span>
                    <CaretRight size={12} className="text-muted-foreground" />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: toPlayer?.color }} />
                    <span className="font-medium text-sm">{toPlayer?.name}</span>
                  </>
                )}
                {isIncoming && (
                  <Badge variant="warning" className="ml-auto text-xs py-0 px-1.5">New</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {trade.offer.properties.length} props + {formatCurrency(trade.offer.cash)} ↔ {trade.request.properties.length} props + {formatCurrency(trade.request.cash)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render my properties section grouped by color
  const renderMyProperties = () => {
    const myPlayer = getMyPlayer();
    if (!myPlayer || !myPlayer.properties || myPlayer.properties.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No properties owned yet
        </div>
      );
    }

    // Group properties by color/type
    const grouped = {};
    myPlayer.properties.forEach(propId => {
      const space = getSpaceById(propId);
      if (space) {
        const key = space.color || space.type;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push({ ...space, propId });
      }
    });

    // Order for display
    const colorOrder = ['brown', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkblue', 'railroad', 'utility'];

    return (
      <div className="space-y-3">
        {colorOrder.map(colorKey => {
          const props = grouped[colorKey];
          if (!props || props.length === 0) return null;

          return (
            <div key={colorKey} className="space-y-1.5">
              {/* Clickable color set header */}
              <button
                className="flex items-center gap-2 w-full p-1.5 rounded hover:bg-secondary/50 transition-colors"
                onClick={() => setSelectedColorSet(colorKey)}
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: COLOR_MAP[colorKey] || '#666' }}
                />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {colorKey === 'railroad' ? 'Railroads' : colorKey === 'utility' ? 'Utilities' : colorKey}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">({props.length})</span>
              </button>
              {/* 2-column grid of properties */}
              <div className="grid grid-cols-2 gap-1.5">
                {props.map(prop => {
                  const property = gameState.properties[prop.propId];
                  return (
                    <div
                      key={prop.propId}
                      ref={el => propertyRefs.current[prop.propId] = el}
                      className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer transition-all hover:bg-secondary/50 bg-secondary/20 ${
                        property?.mortgaged ? 'opacity-50' : ''
                      }`}
                      onClick={() => setSelectedProperty(prop.propId)}
                    >
                      {/* Color bar */}
                      <div
                        className="w-1 h-6 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: COLOR_MAP[colorKey] || '#666' }}
                      />
                      <span className="flex-1 text-xs truncate">{prop.name}</span>
                      {property?.hotels > 0 && (
                        <Badge variant="destructive" className="text-[10px] py-0 px-1 h-4">H</Badge>
                      )}
                      {property?.houses > 0 && !property?.hotels && (
                        <Badge variant="success" className="text-[10px] py-0 px-1 h-4">{property.houses}</Badge>
                      )}
                      {property?.mortgaged && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1 h-4">M</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render property popup card
  const renderPropertyPopup = () => {
    const space = getSpaceById(selectedProperty);
    if (!space) return null;

    const property = gameState.properties[selectedProperty];
    const owner = property?.ownerId ? gameState.players.find(p => p.id === property.ownerId) : null;
    const myPlayer = getMyPlayer();
    const isMyProperty = owner && myPlayer && owner.id === myPlayer.id;

    // Get position of the property item in the list
    const ref = propertyRefs.current[selectedProperty];
    let popupStyle = {};
    if (ref) {
      const rect = ref.getBoundingClientRect();
      popupStyle = {
        position: 'fixed',
        top: rect.top,
        right: window.innerWidth - rect.left + 8,
        zIndex: 100
      };
    }

    return (
      <>
        <div className="fixed inset-0 z-50" onClick={() => setSelectedProperty(null)} />
        <div
          style={popupStyle}
          className="z-[100] w-72 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Color bar */}
          {space.color && (
            <div className="h-6" style={{ backgroundColor: COLOR_MAP[space.color] }} />
          )}

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{space.name}</h3>
              <button
                className="p-1 rounded hover:bg-secondary"
                onClick={() => setSelectedProperty(null)}
              >
                <X size={16} />
              </button>
            </div>

            {owner && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: owner.color }} />
                <span>Owner: <strong>{owner.name}</strong></span>
              </div>
            )}

            {property?.mortgaged && (
              <Badge variant="destructive" className="w-full justify-center">MORTGAGED</Badge>
            )}

            {/* Rent info */}
            {space.type === 'property' && space.rent && (
              <div className="space-y-1 text-sm border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rent</span>
                  <span className={property?.houses === 0 && !property?.hotels ? 'text-primary font-bold' : ''}>${space.rent[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With 1 House</span>
                  <span className={property?.houses === 1 ? 'text-primary font-bold' : ''}>${space.rent[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With 2 Houses</span>
                  <span className={property?.houses === 2 ? 'text-primary font-bold' : ''}>${space.rent[2]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With 3 Houses</span>
                  <span className={property?.houses === 3 ? 'text-primary font-bold' : ''}>${space.rent[3]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With 4 Houses</span>
                  <span className={property?.houses === 4 && !property?.hotels ? 'text-primary font-bold' : ''}>${space.rent[4]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">With Hotel</span>
                  <span className={property?.hotels > 0 ? 'text-primary font-bold' : ''}>${space.rent[5]}</span>
                </div>
              </div>
            )}

            {/* Actions for my properties */}
            {isMyProperty && isMyTurn() && (
              <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                {space.type === 'property' && !property.mortgaged && property.houses < 4 && !property.hotels && (
                  <Button
                    size="sm"
                    variant="success"
                    className="flex-1 gap-1"
                    onClick={() => socket.buildHouse(gameId, selectedProperty)}
                  >
                    <HouseIcon size={14} />
                    House
                  </Button>
                )}
                {space.type === 'property' && !property.mortgaged && property.houses === 4 && !property.hotels && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 gap-1"
                    onClick={() => socket.buildHotel(gameId, selectedProperty)}
                  >
                    <Buildings size={14} />
                    Hotel
                  </Button>
                )}
                {!property.mortgaged && property.houses === 0 && !property.hotels && (
                  <Button
                    size="sm"
                    variant="warning"
                    className="flex-1"
                    onClick={() => socket.mortgage(gameId, selectedProperty)}
                  >
                    Mortgage
                  </Button>
                )}
                {property.mortgaged && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => socket.unmortgage(gameId, selectedProperty)}
                  >
                    Unmortgage
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  // Render trade detail popup
  const renderTradePopup = () => {
    if (!selectedTrade) return null;

    const trade = selectedTrade;
    const fromPlayer = gameState.players.find(p => p.id === trade.fromPlayerId);
    const toPlayer = gameState.players.find(p => p.id === trade.toPlayerId);
    const myPlayer = getMyPlayer();
    const isIncoming = trade.toPlayerId === myPlayer?.id;

    return (
      <>
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setSelectedTrade(null)} />
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Handshake size={20} className="text-primary" />
              Trade Offer
            </h3>
            <button
              className="p-1 rounded hover:bg-secondary"
              onClick={() => setSelectedTrade(null)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* From player offering */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fromPlayer?.color }} />
                <span className="font-medium">{fromPlayer?.name} offers:</span>
              </div>
              <div className="pl-5 space-y-1 text-sm">
                <div className="flex items-center gap-1">
                  <CurrencyDollar size={14} className="text-primary" />
                  {formatCurrency(trade.offer.cash)}
                </div>
                {trade.offer.properties.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Buildings size={14} />
                    {trade.offer.properties.map(id => getSpaceById(id)?.name).join(', ')}
                  </div>
                )}
                {trade.offer.jailCards > 0 && (
                  <div className="flex items-center gap-1">
                    <Key size={14} />
                    {trade.offer.jailCards} Get Out of Jail card(s)
                  </div>
                )}
              </div>
            </div>

            <div className="text-center text-muted-foreground">↕ for ↕</div>

            {/* To player requesting */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: toPlayer?.color }} />
                <span className="font-medium">{toPlayer?.name}'s:</span>
              </div>
              <div className="pl-5 space-y-1 text-sm">
                <div className="flex items-center gap-1">
                  <CurrencyDollar size={14} className="text-primary" />
                  {formatCurrency(trade.request.cash)}
                </div>
                {trade.request.properties.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Buildings size={14} />
                    {trade.request.properties.map(id => getSpaceById(id)?.name).join(', ')}
                  </div>
                )}
                {trade.request.jailCards > 0 && (
                  <div className="flex items-center gap-1">
                    <Key size={14} />
                    {trade.request.jailCards} Get Out of Jail card(s)
                  </div>
                )}
              </div>
            </div>
          </div>

          {isIncoming && (
            <div className="p-4 border-t border-border flex gap-2">
              <Button
                variant="success"
                className="flex-1 gap-1"
                onClick={() => handleAcceptTrade(trade.id)}
                disabled={tradeLoading}
              >
                <Check size={16} />
                Accept
              </Button>
              <Button
                variant="destructive"
                className="flex-1 gap-1"
                onClick={() => handleRejectTrade(trade.id)}
                disabled={tradeLoading}
              >
                <X size={16} />
                Reject
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTrade(null);
                  setShowTradeModal(true);
                }}
                disabled={tradeLoading}
              >
                Counter
              </Button>
            </div>
          )}
          {!isIncoming && (
            <div className="p-4 border-t border-border text-center text-muted-foreground text-sm">
              Waiting for {toPlayer?.name} to respond...
            </div>
          )}
        </div>
      </>
    );
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

      {/* Header - Solid background with Monopoly branding */}
      <header className="relative z-10 flex-shrink-0 flex items-center justify-between px-8 py-5 bg-[#0f1419] border-b-4 border-primary shadow-xl">
        <div className="flex items-center gap-6">
          {/* Monopoly Board SVG Icon */}
          <svg width="48" height="48" viewBox="0 0 100 100" className="text-primary">
            <rect x="10" y="10" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeWidth="4"/>
            <rect x="10" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
            <rect x="70" y="10" width="20" height="20" fill="currentColor" opacity="0.3"/>
            <rect x="10" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
            <rect x="70" y="70" width="20" height="20" fill="currentColor" opacity="0.3"/>
            <circle cx="50" cy="50" r="12" fill="currentColor"/>
          </svg>
          <span className="text-4xl font-bold tracking-wider game-logo" data-text="MONOPOLY">MONOPOLY</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-base text-muted-foreground font-mono">
            Room: <span className="text-primary font-bold tracking-wider">{gameId}</span>
          </span>
          <Button variant="outline" size="default" onClick={() => setShowSettings(true)} className="gap-2 text-base px-4">
            <Gear size={20} />
            Settings
          </Button>
          <Button variant="secondary" size="default" onClick={handleLeaveGame} className="gap-2 text-base px-4">
            <SignOut size={20} />
            Leave
          </Button>
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Game Log (can shrink if needed) */}
        <aside className="w-[480px] flex-shrink flex flex-col gap-3 p-3 bg-card/50 border-r border-border overflow-hidden">
          <GameLog
            actionLog={gameState.actionLog || []}
            socket={socket}
            gameId={gameId}
            playerId={playerId}
            players={gameState.players}
          />
        </aside>

        {/* Center - Board (never shrinks, minimum size preserved) */}
        <section className="flex-1 flex-shrink-0 min-w-[770px] flex items-center justify-center p-2 overflow-hidden game-center">
          <Board2D
            gameState={gameState}
            onRollDice={handleRollDice}
            onEndTurn={() => socket.endTurn(gameId)}
            isMyTurn={isMyTurn()}
            canRoll={canRollDice()}
            canEndTurn={gameState.phase === 'rolling' && isMyTurn() && gameState.hasRolledThisTurn}
            myPlayerId={playerId}
            socket={socket}
            gameId={gameId}
          />
        </section>

        {/* Right Panel - Players, Trades & Properties (can shrink if needed) */}
        <aside className="w-[480px] flex-shrink flex flex-col gap-3 p-3 bg-card/50 border-l border-border overflow-hidden">
          {/* Players Section - Compact */}
          <PlayerPanel
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            myPlayerId={playerId}
            onPlayerClick={(id) => setSelectedPlayer(id)}
          />

          {/* Pending Trades Section */}
          <Card className="card-gilded flex-shrink-0">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Handshake size={20} className="text-primary" weight="duotone" />
                  Trades
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTradeModal(true)}
                  disabled={getMyPlayer()?.isBankrupt}
                  className="gap-1.5 text-xs"
                >
                  <Handshake size={14} />
                  Propose
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 max-h-[200px] overflow-y-auto">
              {renderPendingTrades()}
            </CardContent>
          </Card>

          {/* My Properties Section */}
          <Card className="card-gilded flex-1 min-h-0 flex flex-col">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Buildings size={20} className="text-primary" weight="duotone" />
                My Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex-1 overflow-y-auto">
              {renderMyProperties()}
            </CardContent>
          </Card>
        </aside>
      </main>

      {/* Property Card Popup */}
      {selectedProperty && renderPropertyPopup()}

      {/* Trade Detail Popup */}
      {selectedTrade && renderTradePopup()}

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

      {/* Settings Modal */}
      {showSettings && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowSettings(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[420px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Gear size={20} className="text-primary" />
                Room Settings
              </h3>
              <button className="p-1 rounded hover:bg-secondary" onClick={() => setShowSettings(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Starting Cash</span>
                <span className="font-medium">{formatCurrency(gameState.settings?.startingCash || 1500)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Max Players</span>
                <span className="font-medium">{gameState.settings?.maxPlayers || 6}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Auction Mode</span>
                <Badge variant={gameState.settings?.auctionMode ? 'default' : 'secondary'}>
                  {gameState.settings?.auctionMode ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Double GO Bonus</span>
                <Badge variant={gameState.settings?.doubleGoBonus ? 'default' : 'secondary'}>
                  {gameState.settings?.doubleGoBonus ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">No Rent in Jail</span>
                <Badge variant={gameState.settings?.noRentInJail ? 'default' : 'secondary'}>
                  {gameState.settings?.noRentInJail ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Mortgage Mode</span>
                <Badge variant={gameState.settings?.mortgageMode ? 'default' : 'secondary'}>
                  {gameState.settings?.mortgageMode ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Even Build</span>
                <Badge variant={gameState.settings?.evenBuild ? 'default' : 'secondary'}>
                  {gameState.settings?.evenBuild ? 'ON' : 'OFF'}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Free Parking Jackpot</span>
                <Badge variant={gameState.settings?.freeParking ? 'default' : 'secondary'}>
                  {gameState.settings?.freeParking ? 'ON' : 'OFF'}
                </Badge>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Color Set Modal */}
      {selectedColorSet && (() => {
        const myPlayer = getMyPlayer();
        const props = myPlayer?.properties
          ?.map(propId => ({ ...getSpaceById(propId), propId }))
          ?.filter(p => (p.color || p.type) === selectedColorSet) || [];

        return (
          <>
            <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setSelectedColorSet(null)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[600px] max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLOR_MAP[selectedColorSet] || '#666' }} />
                  {selectedColorSet === 'railroad' ? 'Railroads' : selectedColorSet === 'utility' ? 'Utilities' : selectedColorSet.charAt(0).toUpperCase() + selectedColorSet.slice(1)} Properties
                </h3>
                <button className="p-1 rounded hover:bg-secondary" onClick={() => setSelectedColorSet(null)}>
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
                {props.map(prop => {
                  const property = gameState.properties[prop.propId];
                  const canBuildHouse = prop.type === 'property' && !property?.mortgaged && property?.houses < 4 && !property?.hotels && isMyTurn();
                  const canBuildHotel = prop.type === 'property' && !property?.mortgaged && property?.houses === 4 && !property?.hotels && isMyTurn();

                  return (
                    <div key={prop.propId} className="bg-secondary/30 rounded-lg overflow-hidden border border-border">
                      {prop.color && (
                        <div className="h-4" style={{ backgroundColor: COLOR_MAP[prop.color] }} />
                      )}
                      <div className="p-3 space-y-2">
                        <div className="font-medium text-sm">{prop.name}</div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {property?.hotels > 0 && <Badge variant="destructive" className="text-[10px] py-0 px-1">Hotel</Badge>}
                          {property?.houses > 0 && !property?.hotels && <Badge variant="success" className="text-[10px] py-0 px-1">{property.houses} House{property.houses > 1 ? 's' : ''}</Badge>}
                          {property?.mortgaged && <Badge variant="secondary" className="text-[10px] py-0 px-1">Mortgaged</Badge>}
                          {!property?.hotels && property?.houses === 0 && !property?.mortgaged && <span>No buildings</span>}
                        </div>
                        {(canBuildHouse || canBuildHotel) && (
                          <Button
                            size="sm"
                            variant={canBuildHotel ? 'destructive' : 'success'}
                            className="w-full gap-1 text-xs"
                            onClick={() => {
                              if (canBuildHotel) {
                                socket.buildHotel(gameId, prop.propId);
                              } else {
                                socket.buildHouse(gameId, prop.propId);
                              }
                            }}
                          >
                            {canBuildHotel ? <Buildings size={12} /> : <HouseIcon size={12} />}
                            Build {canBuildHotel ? 'Hotel' : 'House'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      })()}

      {/* Player Properties Modal */}
      {selectedPlayer && (() => {
        const player = gameState.players.find(p => p.id === selectedPlayer);
        if (!player) return null;

        // Group player's properties by color
        const grouped = {};
        player.properties?.forEach(propId => {
          const space = getSpaceById(propId);
          if (space) {
            const key = space.color || space.type;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({ ...space, propId });
          }
        });

        const colorOrder = ['brown', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkblue', 'railroad', 'utility'];

        return (
          <>
            <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setSelectedPlayer(null)} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[500px] max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: player.color }} />
                  {player.name}'s Properties
                </h3>
                <button className="p-1 rounded hover:bg-secondary" onClick={() => setSelectedPlayer(null)}>
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {player.properties?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No properties owned</div>
                ) : (
                  <div className="space-y-3">
                    {colorOrder.map(colorKey => {
                      const props = grouped[colorKey];
                      if (!props || props.length === 0) return null;

                      return (
                        <div key={colorKey}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: COLOR_MAP[colorKey] || '#666' }} />
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">
                              {colorKey === 'railroad' ? 'Railroads' : colorKey === 'utility' ? 'Utilities' : colorKey}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {props.map(prop => {
                              const property = gameState.properties[prop.propId];
                              return (
                                <div key={prop.propId} className="flex items-center gap-2 p-2 bg-secondary/30 rounded text-sm">
                                  <div className="w-1 h-5 rounded-sm" style={{ backgroundColor: COLOR_MAP[colorKey] || '#666' }} />
                                  <span className="flex-1 truncate">{prop.name}</span>
                                  {property?.hotels > 0 && <Badge variant="destructive" className="text-[10px] py-0 px-1">H</Badge>}
                                  {property?.houses > 0 && !property?.hotels && <Badge variant="success" className="text-[10px] py-0 px-1">{property.houses}</Badge>}
                                  {property?.mortgaged && <Badge variant="secondary" className="text-[10px] py-0 px-1">M</Badge>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-border flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CurrencyDollar size={16} className="text-primary" />
                  <span className="font-medium">{formatCurrency(player.cash)}</span>
                </div>
                <div className="text-muted-foreground">
                  {player.properties?.length || 0} properties
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
