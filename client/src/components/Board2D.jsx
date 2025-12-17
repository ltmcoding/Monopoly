import React from 'react';
import { BOARD_SPACES, COLOR_MAP, getSpaceById } from '../utils/boardData';

// Enhanced color map with refined colors
const ENHANCED_COLORS = {
  brown: '#78593a',
  lightblue: '#88c8dc',
  pink: '#c9668f',
  orange: '#e59035',
  red: '#d63b3b',
  yellow: '#e6c84b',
  green: '#3d9d5c',
  darkblue: '#1e4d91',
  railroad: '#3d4045',
  utility: '#5c6370'
};

// Space type icons
const SPACE_ICONS = {
  go: 'GO',
  jail: 'JAIL',
  free_parking: 'FREE',
  go_to_jail: 'GO TO JAIL',
  chance: '?',
  community_chest: 'CC',
  tax: '$',
  railroad: 'RR',
  utility: 'U'
};

export default function Board2D({ gameState, onPropertyClick }) {
  const boardSize = 660;
  const cornerSize = 80;
  const regularSize = 50;
  const colorBarHeight = 12;

  // Calculate position for each space
  const getSpacePosition = (position) => {
    const innerOffset = cornerSize;
    const sideSpaces = 9; // 9 spaces between corners
    const spaceWidth = (boardSize - 2 * cornerSize) / sideSpaces;

    if (position === 0) {
      // GO - bottom right corner
      return { x: boardSize - cornerSize, y: boardSize - cornerSize, w: cornerSize, h: cornerSize, rotation: 0 };
    } else if (position > 0 && position < 10) {
      // Bottom row (right to left)
      return {
        x: boardSize - cornerSize - (position * spaceWidth),
        y: boardSize - cornerSize,
        w: spaceWidth,
        h: cornerSize,
        rotation: 0,
        colorBarSide: 'top'
      };
    } else if (position === 10) {
      // Jail - bottom left corner
      return { x: 0, y: boardSize - cornerSize, w: cornerSize, h: cornerSize, rotation: 0 };
    } else if (position > 10 && position < 20) {
      // Left column (bottom to top)
      const idx = position - 10;
      return {
        x: 0,
        y: boardSize - cornerSize - (idx * spaceWidth),
        w: cornerSize,
        h: spaceWidth,
        rotation: 90,
        colorBarSide: 'right'
      };
    } else if (position === 20) {
      // Free Parking - top left corner
      return { x: 0, y: 0, w: cornerSize, h: cornerSize, rotation: 0 };
    } else if (position > 20 && position < 30) {
      // Top row (left to right)
      const idx = position - 20;
      return {
        x: cornerSize + ((idx - 1) * spaceWidth),
        y: 0,
        w: spaceWidth,
        h: cornerSize,
        rotation: 180,
        colorBarSide: 'bottom'
      };
    } else if (position === 30) {
      // Go To Jail - top right corner
      return { x: boardSize - cornerSize, y: 0, w: cornerSize, h: cornerSize, rotation: 0 };
    } else {
      // Right column (top to bottom)
      const idx = position - 30;
      return {
        x: boardSize - cornerSize,
        y: cornerSize + ((idx - 1) * spaceWidth),
        w: cornerSize,
        h: spaceWidth,
        rotation: 270,
        colorBarSide: 'left'
      };
    }
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

  const getOwnerColor = (ownerId) => {
    const owner = gameState.players.find(p => p.id === ownerId);
    return owner?.color || '#666';
  };

  const renderColorBar = (space, pos) => {
    if (!space.color) return null;
    const color = ENHANCED_COLORS[space.color] || COLOR_MAP[space.color];

    let barX = 0, barY = 0, barW = 0, barH = colorBarHeight;

    switch(pos.colorBarSide) {
      case 'top':
        barW = pos.w;
        break;
      case 'bottom':
        barY = pos.h - colorBarHeight;
        barW = pos.w;
        break;
      case 'left':
        barH = pos.h;
        barW = colorBarHeight;
        break;
      case 'right':
        barX = pos.w - colorBarHeight;
        barH = pos.h;
        barW = colorBarHeight;
        break;
      default:
        return null;
    }

    return (
      <rect
        x={barX}
        y={barY}
        width={barW}
        height={barH}
        fill={color}
      />
    );
  };

  const renderHouses = (propertyState, pos) => {
    if (!propertyState || propertyState.hotels > 0) return null;
    const houses = propertyState.houses;
    if (houses === 0) return null;

    const houseSize = 8;
    const houseGap = 2;
    const startX = (pos.w - (houses * (houseSize + houseGap) - houseGap)) / 2;

    return Array.from({ length: houses }, (_, i) => (
      <rect
        key={`house-${i}`}
        x={startX + i * (houseSize + houseGap)}
        y={colorBarHeight + 2}
        width={houseSize}
        height={houseSize}
        fill="#228B22"
        stroke="#155724"
        strokeWidth="1"
        rx="1"
      />
    ));
  };

  const renderHotel = (propertyState, pos) => {
    if (!propertyState || propertyState.hotels === 0) return null;

    return (
      <rect
        x={(pos.w - 14) / 2}
        y={colorBarHeight + 2}
        width={14}
        height={10}
        fill="#c53030"
        stroke="#9b2c2c"
        strokeWidth="1"
        rx="2"
      />
    );
  };

  const renderMortgaged = (propertyState, pos) => {
    if (!propertyState || !propertyState.mortgaged) return null;

    return (
      <>
        <line
          x1={5}
          y1={5}
          x2={pos.w - 5}
          y2={pos.h - 5}
          stroke="#c53030"
          strokeWidth="2"
          opacity="0.7"
        />
        <line
          x1={pos.w - 5}
          y1={5}
          x2={5}
          y2={pos.h - 5}
          stroke="#c53030"
          strokeWidth="2"
          opacity="0.7"
        />
      </>
    );
  };

  const renderOwnerIndicator = (propertyState, pos) => {
    if (!propertyState || !propertyState.ownerId) return null;

    return (
      <circle
        cx={pos.w / 2}
        cy={pos.h / 2 + 5}
        r={6}
        fill={getOwnerColor(propertyState.ownerId)}
        stroke="#fff"
        strokeWidth="2"
      />
    );
  };

  const renderPlayers = (position, pos) => {
    const players = getPlayersOnSpace(position);
    if (players.length === 0) return null;

    const tokenSize = 10;
    const startX = 10;
    const startY = pos.h - 15;

    return players.map((player, idx) => (
      <g key={player.id}>
        <circle
          cx={startX + idx * 14}
          cy={startY}
          r={tokenSize / 2}
          fill={player.color}
          stroke="#1a202c"
          strokeWidth="2"
        />
        {player.inJail && position === 10 && (
          <text
            x={startX + idx * 14}
            y={startY - 10}
            textAnchor="middle"
            fontSize="8"
            fill="#c53030"
            fontWeight="bold"
          >
            IN
          </text>
        )}
      </g>
    ));
  };

  const renderSpaceContent = (space, pos) => {
    const isCorner = space.position % 10 === 0;

    if (isCorner) {
      return (
        <text
          x={pos.w / 2}
          y={pos.h / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#1a365d"
        >
          {SPACE_ICONS[space.type] || space.name.substring(0, 6)}
        </text>
      );
    }

    // For regular spaces, show name
    const displayName = space.name.length > 10
      ? space.name.substring(0, 10) + '...'
      : space.name;

    return (
      <text
        x={pos.w / 2}
        y={pos.h - 22}
        textAnchor="middle"
        fontSize="7"
        fill="#2d3748"
        fontWeight="500"
      >
        {displayName}
      </text>
    );
  };

  const renderPrice = (space, pos) => {
    if (!space.price) return null;

    return (
      <text
        x={pos.w / 2}
        y={pos.h - 8}
        textAnchor="middle"
        fontSize="8"
        fill="#38a169"
        fontWeight="bold"
      >
        ${space.price}
      </text>
    );
  };

  return (
    <div className="board-2d">
      <svg
        width={boardSize}
        height={boardSize}
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 60px rgba(245, 158, 11, 0.1)'
        }}
      >
        {/* Definitions */}
        <defs>
          <linearGradient id="boardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a3a2a" />
            <stop offset="50%" stopColor="#0f2820" />
            <stop offset="100%" stopColor="#1a3a2a" />
          </linearGradient>
          <filter id="dropShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
          </filter>
        </defs>

        {/* Outer border */}
        <rect
          x="0"
          y="0"
          width={boardSize}
          height={boardSize}
          fill="#0d1117"
          rx="12"
        />

        {/* Inner board */}
        <rect
          x={cornerSize}
          y={cornerSize}
          width={boardSize - 2 * cornerSize}
          height={boardSize - 2 * cornerSize}
          fill="url(#boardBg)"
        />

        {/* Center logo area */}
        <g transform={`translate(${boardSize/2}, ${boardSize/2})`}>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="36"
            fontWeight="bold"
            fill="#f59e0b"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="4"
            style={{ textShadow: '0 2px 10px rgba(245, 158, 11, 0.3)' }}
          >
            MONOPOLY
          </text>

          {/* Dice display */}
          {gameState.dice && (
            <g transform="translate(0, 50)">
              {gameState.dice.map((die, idx) => (
                <g key={idx} transform={`translate(${-30 + idx * 35}, 0)`}>
                  <rect
                    x="-15"
                    y="-15"
                    width="30"
                    height="30"
                    fill="#fff"
                    stroke="#1a365d"
                    strokeWidth="2"
                    rx="5"
                    filter="url(#dropShadow)"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="18"
                    fontWeight="bold"
                    fill="#1a365d"
                  >
                    {die}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Current player indicator */}
          <g transform="translate(0, 110)">
            <rect
              x="-80"
              y="-15"
              width="160"
              height="30"
              fill="rgba(26, 54, 93, 0.1)"
              rx="15"
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="#1a365d"
              fontWeight="600"
            >
              {gameState.players[gameState.currentPlayerIndex]?.name}'s Turn
            </text>
          </g>
        </g>

        {/* Board spaces */}
        {BOARD_SPACES.map((space) => {
          const pos = getSpacePosition(space.position);
          const propertyState = getPropertyState(space);
          const isCorner = space.position % 10 === 0;

          return (
            <g
              key={space.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => onPropertyClick && onPropertyClick(space.id)}
              style={{ cursor: 'pointer' }}
              className="board-space"
            >
              {/* Space background */}
              <rect
                width={pos.w}
                height={pos.h}
                fill={isCorner ? '#e2e8f0' : '#f7fafc'}
                stroke="#1a365d"
                strokeWidth="1"
              />

              {/* Color bar for properties */}
              {renderColorBar(space, pos)}

              {/* Houses */}
              {renderHouses(propertyState, pos)}

              {/* Hotel */}
              {renderHotel(propertyState, pos)}

              {/* Mortgaged indicator */}
              {renderMortgaged(propertyState, pos)}

              {/* Owner indicator */}
              {renderOwnerIndicator(propertyState, pos)}

              {/* Space content */}
              {renderSpaceContent(space, pos)}

              {/* Price */}
              {!isCorner && renderPrice(space, pos)}

              {/* Players on this space */}
              {renderPlayers(space.position, pos)}
            </g>
          );
        })}

        {/* Corner embellishments */}
        <g transform={`translate(${boardSize - cornerSize/2}, ${boardSize - cornerSize/2})`}>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#38a169"
          >
            GO
          </text>
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            y="15"
            fontSize="8"
            fill="#276749"
          >
            Collect $200
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="board-legend">
        <div className="legend-item">
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            backgroundColor: '#228B22',
            borderRadius: '2px',
            marginRight: '4px'
          }}></span>
          <span className="legend-label">House</span>

          <span style={{
            display: 'inline-block',
            width: '16px',
            height: '12px',
            backgroundColor: '#c53030',
            borderRadius: '2px',
            marginLeft: '16px',
            marginRight: '4px'
          }}></span>
          <span className="legend-label">Hotel</span>

          <span style={{
            display: 'inline-block',
            marginLeft: '16px',
            color: '#c53030',
            fontWeight: 'bold'
          }}>X</span>
          <span className="legend-label" style={{ marginLeft: '4px' }}>Mortgaged</span>
        </div>
      </div>
    </div>
  );
}
