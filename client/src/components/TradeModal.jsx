import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { getSpaceById } from '../utils/boardData';
import { formatCurrency } from '../utils/formatters';

export default function TradeModal({ gameId, gameState, myPlayer, onClose }) {
  const socket = useSocket();
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content trade-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h2>Trade</h2>

        {pendingTradesForMe.length > 0 && (
          <div className="pending-trades">
            <h3>Pending Offers for You:</h3>
            {pendingTradesForMe.map(trade => {
              const fromPlayer = gameState.players.find(p => p.id === trade.fromPlayerId);
              return (
                <div key={trade.id} className="trade-offer">
                  <div className="trade-from">
                    <strong>{fromPlayer?.name} offers:</strong>
                    <div>Cash: {formatCurrency(trade.offer.cash)}</div>
                    <div>Properties: {trade.offer.properties.length}</div>
                    {trade.offer.jailCards > 0 && <div>Jail Cards: {trade.offer.jailCards}</div>}
                  </div>
                  <div className="trade-for">
                    <strong>For:</strong>
                    <div>Cash: {formatCurrency(trade.request.cash)}</div>
                    <div>Properties: {trade.request.properties.length}</div>
                    {trade.request.jailCards > 0 && <div>Jail Cards: {trade.request.jailCards}</div>}
                  </div>
                  <div className="trade-actions">
                    <button
                      className="btn btn-success btn-small"
                      onClick={() => handleAcceptTrade(trade.id)}
                      disabled={loading}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleRejectTrade(trade.id)}
                      disabled={loading}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="trade-propose">
          <h3>Propose New Trade:</h3>

          <div className="trade-section">
            <label>Trade with:</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="trade-select"
            >
              <option value="">Select a player</option>
              {otherPlayers.map(player => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <div className="trade-columns">
            <div className="trade-column">
              <h4>You Offer:</h4>

              <div className="trade-section">
                <label>Cash: {formatCurrency(offerCash)}</label>
                <input
                  type="number"
                  min="0"
                  max={myPlayer.cash}
                  value={offerCash}
                  onChange={(e) => setOfferCash(parseInt(e.target.value) || 0)}
                  className="trade-input"
                />
              </div>

              <div className="trade-section">
                <label>Your Properties:</label>
                <div className="property-checkboxes">
                  {myPlayer.properties.map(propId => {
                    const space = getSpaceById(propId);
                    const property = gameState.properties[propId];
                    const hasBuildings = property.houses > 0 || property.hotels > 0;
                    return (
                      <label key={propId} className="property-checkbox">
                        <input
                          type="checkbox"
                          checked={offerProperties.includes(propId)}
                          onChange={() => toggleOfferProperty(propId)}
                          disabled={hasBuildings}
                        />
                        <span>{space.name}</span>
                        {hasBuildings && <span className="has-buildings">(has buildings)</span>}
                      </label>
                    );
                  })}
                </div>
              </div>

              {myPlayer.getOutOfJailCards > 0 && (
                <div className="trade-section">
                  <label>Jail Cards:</label>
                  <input
                    type="number"
                    min="0"
                    max={myPlayer.getOutOfJailCards}
                    value={offerJailCards}
                    onChange={(e) => setOfferJailCards(parseInt(e.target.value) || 0)}
                    className="trade-input"
                  />
                </div>
              )}
            </div>

            <div className="trade-column">
              <h4>You Request:</h4>

              <div className="trade-section">
                <label>Cash: {formatCurrency(requestCash)}</label>
                <input
                  type="number"
                  min="0"
                  max={selectedPlayerData?.cash || 0}
                  value={requestCash}
                  onChange={(e) => setRequestCash(parseInt(e.target.value) || 0)}
                  className="trade-input"
                  disabled={!selectedPlayer}
                />
              </div>

              <div className="trade-section">
                <label>Their Properties:</label>
                <div className="property-checkboxes">
                  {selectedPlayerData?.properties.map(propId => {
                    const space = getSpaceById(propId);
                    const property = gameState.properties[propId];
                    const hasBuildings = property.houses > 0 || property.hotels > 0;
                    return (
                      <label key={propId} className="property-checkbox">
                        <input
                          type="checkbox"
                          checked={requestProperties.includes(propId)}
                          onChange={() => toggleRequestProperty(propId)}
                          disabled={hasBuildings}
                        />
                        <span>{space.name}</span>
                        {hasBuildings && <span className="has-buildings">(has buildings)</span>}
                      </label>
                    );
                  }) || <div>Select a player first</div>}
                </div>
              </div>

              {selectedPlayerData && selectedPlayerData.getOutOfJailCards > 0 && (
                <div className="trade-section">
                  <label>Jail Cards:</label>
                  <input
                    type="number"
                    min="0"
                    max={selectedPlayerData.getOutOfJailCards}
                    value={requestJailCards}
                    onChange={(e) => setRequestJailCards(parseInt(e.target.value) || 0)}
                    className="trade-input"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleProposeTrade}
              disabled={loading || !selectedPlayer}
            >
              Propose Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
