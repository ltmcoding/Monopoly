import React, { useState } from 'react';
import { getSpaceById } from '../utils/boardData';
import { formatCurrency } from '../utils/formatters';

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
    <div className="modal-overlay">
      <div className="modal-content auction-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Auction in Progress</h2>

        <div className="auction-property">
          <h3>{property?.name}</h3>
          <div className="auction-property-price">
            List Price: {formatCurrency(property?.price || 0)}
          </div>
        </div>

        <div className="auction-current-bid">
          {auction.currentBid > 0 ? (
            <>
              <div className="current-bid-label">Current Bid:</div>
              <div className="current-bid-amount">{formatCurrency(auction.currentBid)}</div>
              {isWinning && (
                <div className="winning-indicator">🏆 You are winning!</div>
              )}
            </>
          ) : (
            <div className="no-bids">No bids yet. Starting bid: $10</div>
          )}
        </div>

        <div className="auction-bid-section">
          <label>Your Bid:</label>
          <div className="bid-input-group">
            <input
              type="number"
              min={minBid}
              max={myPlayer.cash}
              step="10"
              value={bidAmount}
              onChange={(e) => setBidAmount(parseInt(e.target.value) || minBid)}
              className="bid-input"
            />
            <button
              className="btn btn-primary"
              onClick={handlePlaceBid}
              disabled={loading || bidAmount <= auction.currentBid || bidAmount > myPlayer.cash}
            >
              Place Bid
            </button>
          </div>
          <div className="bid-hint">
            Min bid: {formatCurrency(minBid)} | Your cash: {formatCurrency(myPlayer.cash)}
          </div>
        </div>

        <div className="auction-history">
          <h4>Bid History:</h4>
          <div className="bid-list">
            {auction.bids && auction.bids.length > 0 ? (
              [...auction.bids].reverse().slice(0, 5).map((bid, index) => (
                <div key={`${bid.timestamp}-${index}`} className="bid-entry">
                  <span>{formatCurrency(bid.amount)}</span>
                </div>
              ))
            ) : (
              <div className="no-bids-yet">No bids placed yet</div>
            )}
          </div>
        </div>

        <div className="auction-info">
          <p>The auction will continue until the host or current player ends it.</p>
          <p>Highest bidder wins the property.</p>
        </div>

        {canEndAuction && (
          <div className="modal-actions">
            <button
              className="btn btn-warning"
              onClick={handleEndAuction}
              disabled={loading}
            >
              End Auction
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
