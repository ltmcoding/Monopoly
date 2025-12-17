import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { getSpaceById, COLOR_MAP } from '../utils/boardData';

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
    <div className="player-panel">
      <h3>Players</h3>
      <div className="players-list-game">
        {players.map((player, index) => {
          const isCurrentPlayer = index === currentPlayerIndex;
          const isMe = player.id === myPlayerId;
          const isBankrupt = player.isBankrupt;

          return (
            <div
              key={player.id}
              className={`player-card ${isCurrentPlayer ? 'current-turn' : ''} ${isBankrupt ? 'bankrupt' : ''} ${isMe ? 'my-player' : ''}`}
            >
              <div className="player-card-header">
                <div
                  className="player-color-dot"
                  style={{ backgroundColor: player.color }}
                />
                <div className="player-info">
                  <div className="player-name-game">
                    {player.name}
                    {isMe && <span className="you-badge">YOU</span>}
                  </div>
                  <div className="player-cash">{formatCurrency(player.cash)}</div>
                </div>
              </div>

              <div className="player-stats">
                {player.inJail && (
                  <div className="stat jail-indicator">
                    <span>In Jail ({3 - player.jailTurns} turns left)</span>
                  </div>
                )}

                {player.getOutOfJailCards > 0 && (
                  <div className="stat">
                    <span className="stat-label">Jail Cards:</span>
                    <span className="stat-value">{player.getOutOfJailCards}</span>
                  </div>
                )}

                {isBankrupt && (
                  <div className="stat bankrupt-indicator">
                    <span>Bankrupt</span>
                  </div>
                )}
              </div>

              {/* Owned Properties List */}
              {player.properties.length > 0 && gameState && (
                <div className="player-properties-list">
                  <div className="properties-header">Properties ({player.properties.length})</div>
                  <div className="properties-grid">
                    {player.properties.map(propId => {
                      const space = getSpaceById(propId);
                      const prop = gameState.properties[propId];
                      if (!space || !prop) return null;
                      return (
                        <div
                          key={propId}
                          className={`owned-property-chip ${prop.mortgaged ? 'mortgaged' : ''}`}
                          style={{
                            borderLeftColor: getPropertyColor(space),
                            borderLeftWidth: '3px',
                            borderLeftStyle: 'solid'
                          }}
                          title={`${space.name}${prop.houses > 0 ? ` (${prop.houses}H)` : ''}${prop.hotels > 0 ? ' (Hotel)' : ''}${prop.mortgaged ? ' [M]' : ''}`}
                        >
                          <span className="prop-name">{space.name}</span>
                          {prop.houses > 0 && <span className="prop-houses">{prop.houses}H</span>}
                          {prop.hotels > 0 && <span className="prop-hotel">H</span>}
                          {prop.mortgaged && <span className="prop-mortgaged">M</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {player.properties.length === 0 && (
                <div className="no-properties">No properties</div>
              )}

              {isCurrentPlayer && !isBankrupt && (
                <div className="current-turn-indicator">
                  Current Turn
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
