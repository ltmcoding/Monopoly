import React from 'react';
import { BOARD_SPACES, COLOR_MAP, getSpaceById } from '../utils/boardData';

export default function Board2D({ gameState, onPropertyClick }) {
  // Calculate positions for board spaces (arranged in a square)
  const getBoardPosition = (position) => {
    const boardSize = 600;
    const spaceSize = 50;

    if (position >= 0 && position <= 10) {
      // Bottom row (right to left)
      return {
        x: boardSize - (position * (boardSize / 10)),
        y: boardSize - spaceSize
      };
    } else if (position >= 11 && position <= 19) {
      // Left column (bottom to top)
      const offset = position - 11;
      return {
        x: 0,
        y: boardSize - spaceSize - ((offset + 1) * (boardSize / 10))
      };
    } else if (position >= 20 && position <= 30) {
      // Top row (left to right)
      const offset = position - 20;
      return {
        x: offset * (boardSize / 10),
        y: 0
      };
    } else {
      // Right column (top to bottom)
      const offset = position - 31;
      return {
        x: boardSize - spaceSize,
        y: (offset + 1) * (boardSize / 10)
      };
    }
  };

  const getSpaceColor = (space) => {
    if (space.color) {
      return COLOR_MAP[space.color] || '#CCC';
    }
    return '#DDD';
  };

  const getPlayersOnSpace = (position) => {
    return gameState.players.filter(p => p.position === position && !p.isBankrupt);
  };

  const getPropertyState = (space) => {
    if (space.type === 'property' || space.type === 'railroad' || space.type === 'utility') {
      return gameState.properties[space.id];
    }
    return null;
  };

  return (
    <div className="board-2d">
      <svg width="650" height="650" viewBox="0 0 650 650">
        {/* Board background */}
        <rect x="60" y="60" width="530" height="530" fill="#C8E6C9" stroke="#333" strokeWidth="2" />

        {/* Center info */}
        <g transform="translate(325, 300)">
          <text textAnchor="middle" fontSize="24" fontWeight="bold" fill="#333">
            MONOPOLY
          </text>
          {gameState.dice && (
            <g transform="translate(0, 40)">
              <text textAnchor="middle" fontSize="18" fill="#666">
                Dice: {gameState.dice.join(', ')}
              </text>
            </g>
          )}
          <g transform="translate(0, 70)">
            <text textAnchor="middle" fontSize="14" fill="#666">
              {gameState.players[gameState.currentPlayerIndex]?.name}'s turn
            </text>
          </g>
        </g>

        {/* Board spaces */}
        {BOARD_SPACES.map((space) => {
          const pos = getBoardPosition(space.position);
          const propertyState = getPropertyState(space);
          const playersHere = getPlayersOnSpace(space.position);
          const isCorner = space.position % 10 === 0;
          const size = isCorner ? 60 : 50;

          return (
            <g key={space.id} transform={`translate(${pos.x}, ${pos.y})`}>
              {/* Space background */}
              <rect
                width={size}
                height={size}
                fill={getSpaceColor(space)}
                stroke="#333"
                strokeWidth="1"
                className="board-space"
                onClick={() => onPropertyClick && onPropertyClick(space.id)}
                style={{ cursor: 'pointer' }}
              />

              {/* Color bar for properties */}
              {space.color && (
                <rect
                  width={size}
                  height="10"
                  fill={COLOR_MAP[space.color]}
                />
              )}

              {/* Property owner indicator */}
              {propertyState && propertyState.ownerId && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r="5"
                  fill={gameState.players.find(p => p.id === propertyState.ownerId)?.color || '#000'}
                />
              )}

              {/* Buildings */}
              {propertyState && propertyState.houses > 0 && (
                <text
                  x={size - 15}
                  y={20}
                  fontSize="12"
                  fill="#00FF00"
                  fontWeight="bold"
                >
                  H:{propertyState.houses}
                </text>
              )}
              {propertyState && propertyState.hotels > 0 && (
                <text
                  x={size - 15}
                  y={20}
                  fontSize="12"
                  fill="#FF0000"
                  fontWeight="bold"
                >
                  🏨
                </text>
              )}

              {/* Mortgaged indicator */}
              {propertyState && propertyState.mortgaged && (
                <text
                  x={size / 2}
                  y={size / 2 + 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#FF0000"
                  fontWeight="bold"
                >
                  M
                </text>
              )}

              {/* Players on this space */}
              {playersHere.map((player, idx) => (
                <circle
                  key={player.id}
                  cx={10 + (idx * 8)}
                  cy={size - 10}
                  r="4"
                  fill={player.color}
                  stroke="#000"
                  strokeWidth="1"
                />
              ))}

              {/* Space name (abbreviated) */}
              <text
                x={size / 2}
                y={size - 18}
                textAnchor="middle"
                fontSize="6"
                fill="#000"
              >
                {space.name.substring(0, 12)}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="board-legend">
        <div className="legend-item">
          <span className="legend-label">H: Houses</span>
          <span className="legend-label">🏨: Hotel</span>
          <span className="legend-label">M: Mortgaged</span>
        </div>
      </div>
    </div>
  );
}
