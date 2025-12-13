import React from 'react';
import { formatCurrency } from '../utils/formatters';

export default function PlayerPanel({ players, currentPlayerIndex, myPlayerId }) {
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
                <div className="stat">
                  <span className="stat-label">Properties:</span>
                  <span className="stat-value">{player.properties.length}</span>
                </div>

                {player.inJail && (
                  <div className="stat jail-indicator">
                    <span>🔒 In Jail ({3 - player.jailTurns} turns left)</span>
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
                    <span>💀 Bankrupt</span>
                  </div>
                )}
              </div>

              {isCurrentPlayer && !isBankrupt && (
                <div className="current-turn-indicator">
                  ▶ Current Turn
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
