import React, { useState } from 'react';
import {
  Handshake,
  X,
  CurrencyDollar,
  Buildings,
  Key,
  Check,
  ArrowRight,
  House
} from '@phosphor-icons/react';
import { getSpaceById } from '../utils/boardData';
import { formatCurrency } from '../utils/formatters';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './ui/dialog';

export default function TradeModal({ socket, gameId, gameState, myPlayer, onClose }) {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [offerCash, setOfferCash] = useState(0);
  const [offerProperties, setOfferProperties] = useState([]);
  const [offerJailCards, setOfferJailCards] = useState(0);
  const [requestCash, setRequestCash] = useState(0);
  const [requestProperties, setRequestProperties] = useState([]);
  const [requestJailCards, setRequestJailCards] = useState(0);
  const [loading, setLoading] = useState(false);

  const otherPlayers = gameState.players.filter(
    p => p.id !== myPlayer.id && !p.isBankrupt
  );

  const selectedPlayerData = gameState.players.find(p => p.id === selectedPlayer);

  const handleProposeTrade = async () => {
    if (!selectedPlayer) {
      alert('Please select a player');
      return;
    }

    if (offerCash < 0 || requestCash < 0) {
      alert('Cash amounts cannot be negative');
      return;
    }

    if (offerCash > myPlayer.cash) {
      alert('You don\'t have enough cash to offer');
      return;
    }

    if (selectedPlayerData && requestCash > selectedPlayerData.cash) {
      alert('Selected player doesn\'t have enough cash');
      return;
    }

    setLoading(true);
    try {
      await socket.proposeTrade(gameId, selectedPlayer, {
        cash: offerCash,
        properties: offerProperties,
        jailCards: offerJailCards
      }, {
        cash: requestCash,
        properties: requestProperties,
        jailCards: requestJailCards
      });

      alert('Trade proposed successfully!');
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to propose trade');
    } finally {
      setLoading(false);
    }
  };

  const toggleOfferProperty = (propId) => {
    if (offerProperties.includes(propId)) {
      setOfferProperties(offerProperties.filter(id => id !== propId));
    } else {
      setOfferProperties([...offerProperties, propId]);
    }
  };

  const toggleRequestProperty = (propId) => {
    if (requestProperties.includes(propId)) {
      setRequestProperties(requestProperties.filter(id => id !== propId));
    } else {
      setRequestProperties([...requestProperties, propId]);
    }
  };

  // Check for pending trades for me
  const pendingTradesForMe = gameState.trades?.filter(
    t => t.toPlayerId === myPlayer.id && t.status === 'pending'
  ) || [];

  const handleAcceptTrade = async (tradeId) => {
    setLoading(true);
    try {
      await socket.acceptTrade(gameId, tradeId);
      alert('Trade accepted!');
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to accept trade');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTrade = async (tradeId) => {
    setLoading(true);
    try {
      await socket.rejectTrade(gameId, tradeId);
      alert('Trade rejected');
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to reject trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Handshake size={24} className="text-primary" />
            <DialogTitle>Trade</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Pending Trades */}
          {pendingTradesForMe.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="warning">{pendingTradesForMe.length}</Badge>
                Pending Offers for You
              </h3>
              {pendingTradesForMe.map(trade => {
                const fromPlayer = gameState.players.find(p => p.id === trade.fromPlayerId);
                return (
                  <div key={trade.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: fromPlayer?.color }}
                      />
                      <span className="font-semibold">{fromPlayer?.name}</span>
                      <span className="text-muted-foreground">offers:</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">They offer:</div>
                        <div className="flex items-center gap-1">
                          <CurrencyDollar size={14} className="text-primary" />
                          {formatCurrency(trade.offer.cash)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Buildings size={14} />
                          {trade.offer.properties.length} properties
                        </div>
                        {trade.offer.jailCards > 0 && (
                          <div className="flex items-center gap-1">
                            <Key size={14} />
                            {trade.offer.jailCards} jail cards
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">They want:</div>
                        <div className="flex items-center gap-1">
                          <CurrencyDollar size={14} className="text-primary" />
                          {formatCurrency(trade.request.cash)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Buildings size={14} />
                          {trade.request.properties.length} properties
                        </div>
                        {trade.request.jailCards > 0 && (
                          <div className="flex items-center gap-1">
                            <Key size={14} />
                            {trade.request.jailCards} jail cards
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleAcceptTrade(trade.id)}
                        disabled={loading}
                        className="gap-1"
                      >
                        <Check size={16} />
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectTrade(trade.id)}
                        disabled={loading}
                        className="gap-1"
                      >
                        <X size={16} />
                        Reject
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Propose New Trade */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Propose New Trade</h3>

            {/* Player Selection */}
            <div className="space-y-2">
              <Label>Trade with:</Label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a player</option>
                {otherPlayers.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({formatCurrency(player.cash)})
                  </option>
                ))}
              </select>
            </div>

            {/* Trade Columns */}
            <div className="grid grid-cols-2 gap-4">
              {/* You Offer */}
              <div className="space-y-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <h4 className="font-semibold text-green-500 flex items-center gap-2">
                  <ArrowRight size={16} />
                  You Offer
                </h4>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <CurrencyDollar size={14} />
                    Cash: {formatCurrency(offerCash)}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={myPlayer.cash}
                    value={offerCash}
                    onChange={(e) => setOfferCash(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Buildings size={14} />
                    Your Properties
                  </Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {myPlayer.properties.map(propId => {
                      const space = getSpaceById(propId);
                      const property = gameState.properties[propId];
                      const hasBuildings = property.houses > 0 || property.hotels > 0;
                      return (
                        <label
                          key={propId}
                          className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer transition-colors ${
                            offerProperties.includes(propId)
                              ? 'bg-green-500/20'
                              : 'hover:bg-secondary/50'
                          } ${hasBuildings ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={offerProperties.includes(propId)}
                            onChange={() => toggleOfferProperty(propId)}
                            disabled={hasBuildings}
                            className="rounded border-input"
                          />
                          <span className="truncate">{space.name}</span>
                          {hasBuildings && (
                            <House size={12} className="text-green-500" />
                          )}
                        </label>
                      );
                    })}
                    {myPlayer.properties.length === 0 && (
                      <span className="text-muted-foreground text-xs">No properties</span>
                    )}
                  </div>
                </div>

                {myPlayer.getOutOfJailCards > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Key size={14} />
                      Jail Cards ({myPlayer.getOutOfJailCards} available)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max={myPlayer.getOutOfJailCards}
                      value={offerJailCards}
                      onChange={(e) => setOfferJailCards(parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>

              {/* You Request */}
              <div className="space-y-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <h4 className="font-semibold text-amber-500 flex items-center gap-2">
                  <ArrowRight size={16} className="rotate-180" />
                  You Request
                </h4>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <CurrencyDollar size={14} />
                    Cash: {formatCurrency(requestCash)}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max={selectedPlayerData?.cash || 0}
                    value={requestCash}
                    onChange={(e) => setRequestCash(parseInt(e.target.value) || 0)}
                    disabled={!selectedPlayer}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Buildings size={14} />
                    Their Properties
                  </Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedPlayerData?.properties.map(propId => {
                      const space = getSpaceById(propId);
                      const property = gameState.properties[propId];
                      const hasBuildings = property.houses > 0 || property.hotels > 0;
                      return (
                        <label
                          key={propId}
                          className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer transition-colors ${
                            requestProperties.includes(propId)
                              ? 'bg-amber-500/20'
                              : 'hover:bg-secondary/50'
                          } ${hasBuildings ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={requestProperties.includes(propId)}
                            onChange={() => toggleRequestProperty(propId)}
                            disabled={hasBuildings}
                            className="rounded border-input"
                          />
                          <span className="truncate">{space.name}</span>
                          {hasBuildings && (
                            <House size={12} className="text-green-500" />
                          )}
                        </label>
                      );
                    }) || (
                      <span className="text-muted-foreground text-xs">
                        {selectedPlayer ? 'No properties' : 'Select a player first'}
                      </span>
                    )}
                  </div>
                </div>

                {selectedPlayerData && selectedPlayerData.getOutOfJailCards > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Key size={14} />
                      Jail Cards ({selectedPlayerData.getOutOfJailCards} available)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max={selectedPlayerData.getOutOfJailCards}
                      value={requestJailCards}
                      onChange={(e) => setRequestJailCards(parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleProposeTrade}
            disabled={loading || !selectedPlayer}
            className="gap-2"
          >
            <Handshake size={18} />
            Propose Trade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
