import React, { useState } from 'react';
import {
  Gavel,
  Trophy,
  CurrencyDollar,
  Buildings,
  Timer,
  ArrowUp,
  ClockCountdown
} from '@phosphor-icons/react';
import { getSpaceById } from '../utils/boardData';
import { formatCurrency } from '../utils/formatters';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function AuctionModal({ socket, gameId, auction, myPlayer, gameState }) {
  const [bidAmount, setBidAmount] = useState((auction.currentBid || 0) + 10);
  const [loading, setLoading] = useState(false);

  const property = getSpaceById(auction.propertyId);
  const isWinning = auction.currentBidder === myPlayer.id;
  const minBid = auction.currentBid + 1;
  const currentPlayer = gameState?.players[gameState?.currentPlayerIndex];
  const canEndAuction = myPlayer.id === gameState?.hostId || myPlayer.id === currentPlayer?.id;

  const handlePlaceBid = async () => {
    if (bidAmount <= auction.currentBid) {
      alert(`Bid must be higher than current bid of ${formatCurrency(auction.currentBid)}`);
      return;
    }

    if (bidAmount > myPlayer.cash) {
      alert('You don\'t have enough cash for this bid');
      return;
    }

    setLoading(true);
    try {
      await socket.placeBid(gameId, bidAmount);
      setBidAmount(bidAmount + 10); // Increment for next bid
    } catch (err) {
      alert(err.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  const handleEndAuction = async () => {
    setLoading(true);
    try {
      await socket.endAuction(gameId);
    } catch (err) {
      alert(err.message || 'Failed to end auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 shadow-2xl border-primary/20">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Gavel size={32} className="text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Auction in Progress</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Property Info */}
          <div className="text-center p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Buildings size={20} className="text-primary" />
              <span className="text-lg font-bold">{property?.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              List Price: <span className="text-primary font-semibold">{formatCurrency(property?.price || 0)}</span>
            </div>
          </div>

          {/* Current Bid */}
          <div className="text-center p-4 rounded-lg bg-card border border-border">
            {auction.currentBid > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Current Bid</div>
                <div className="text-3xl font-bold text-primary font-mono">
                  {formatCurrency(auction.currentBid)}
                </div>
                {isWinning && (
                  <Badge variant="success" className="gap-1">
                    <Trophy size={14} weight="fill" />
                    You are winning!
                  </Badge>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <ClockCountdown size={32} className="mx-auto text-muted-foreground" />
                <div className="text-muted-foreground">No bids yet</div>
                <div className="text-sm">Starting bid: <span className="text-primary">$10</span></div>
              </div>
            )}
          </div>

          {/* Bid Section */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <CurrencyDollar size={16} />
              Your Bid
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min={minBid}
                max={myPlayer.cash}
                step="10"
                value={bidAmount}
                onChange={(e) => setBidAmount(parseInt(e.target.value) || minBid)}
                className="font-mono"
              />
              <Button
                onClick={handlePlaceBid}
                disabled={loading || bidAmount <= auction.currentBid || bidAmount > myPlayer.cash}
                className="gap-2 px-6"
              >
                <ArrowUp size={18} weight="bold" />
                Bid
              </Button>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {formatCurrency(minBid)}</span>
              <span>Your cash: {formatCurrency(myPlayer.cash)}</span>
            </div>
          </div>

          {/* Bid History */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Timer size={16} />
              Recent Bids
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {auction.bids && auction.bids.length > 0 ? (
                [...auction.bids].reverse().slice(0, 5).map((bid, index) => (
                  <div
                    key={`${bid.timestamp}-${index}`}
                    className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm"
                  >
                    <span className="text-muted-foreground">#{auction.bids.length - index}</span>
                    <span className="font-mono font-semibold text-primary">
                      {formatCurrency(bid.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground text-sm py-2">
                  No bids placed yet
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>The auction will continue until the host or current player ends it.</p>
            <p>Highest bidder wins the property.</p>
          </div>

          {/* End Auction Button */}
          {canEndAuction && (
            <Button
              variant="warning"
              size="lg"
              className="w-full gap-2"
              onClick={handleEndAuction}
              disabled={loading}
            >
              <Gavel size={20} />
              End Auction
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
