import React, { useState, useEffect, useRef } from 'react';
import { BOARD_SPACES, COLOR_MAP, getSpaceById } from '../utils/boardData';

// Enhanced property colors (vibrant for dark mode)
const ENHANCED_COLORS = {
  brown: '#8B4513',
  lightblue: '#5DADE2',
  pink: '#E066A6',
  orange: '#E67E22',
  red: '#E74C3C',
  yellow: '#F4D03F',
  green: '#27AE60',
  darkblue: '#2E86AB',
  railroad: '#4a4a4a',
  utility: '#6c757d'
};

// Dark mode tile colors
const TILE_COLORS = {
  background: '#1a1f25',
  backgroundCorner: '#151a1f',
  text: '#e6edf3',
  textMuted: '#8b949e',
  price: '#d4a932', // Gold price
  border: '#c9a227', // Gold border
  borderDark: '#8b7355',
};

// Wood colors for borders - darker shades
const WOOD_COLORS = {
  light: '#5c3d1e',
  medium: '#4a2f17',
  dark: '#2d1a0e',
  grain1: '#5a3518',
  grain2: '#3d2512',
};

// Dice pip positions (normalized 0-1)
const PIP_POSITIONS = {
  1: [[0.5, 0.5]],
  2: [[0.28, 0.28], [0.72, 0.72]],
  3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
  4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
  5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
  6: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.5], [0.72, 0.5], [0.28, 0.72], [0.72, 0.72]],
};

// Dice face component with pips
const DiceFace = ({ value, size, isRolling }) => {
  const pips = PIP_POSITIONS[value] || [];
  const pipRadius = size * 0.09;

  return (
    <g className={isRolling ? 'dice-rolling' : ''}>
      {/* Dice shadow */}
      <rect
        x={-size/2 + 3}
        y={-size/2 + 3}
        width={size}
        height={size}
        fill="rgba(0,0,0,0.3)"
        rx={size * 0.18}
      />
      {/* Dice body */}
      <rect
        x={-size/2}
        y={-size/2}
        width={size}
        height={size}
        fill="url(#diceGradient)"
        stroke="#ccc"
        strokeWidth="2"
        rx={size * 0.18}
      />
      {/* Pips */}
      {pips.map(([px, py], idx) => (
        <circle
          key={idx}
          cx={-size/2 + px * size}
          cy={-size/2 + py * size}
          r={pipRadius}
          fill="#1a1a1a"
        />
      ))}
    </g>
  );
};

// Speed die face (1,2,3, Bus, Mr. Monopoly)
const SpeedDieFace = ({ value, size }) => {
  return (
    <g>
      <rect
        x={-size/2 + 2}
        y={-size/2 + 2}
        width={size}
        height={size}
        fill="rgba(0,0,0,0.3)"
        rx={size * 0.18}
      />
      <rect
        x={-size/2}
        y={-size/2}
        width={size}
        height={size}
        fill="#2ecc71"
        stroke="#27ae60"
        strokeWidth="2"
        rx={size * 0.18}
      />
      {typeof value === 'number' ? (
        PIP_POSITIONS[value]?.map(([px, py], idx) => (
          <circle
            key={idx}
            cx={-size/2 + px * size}
            cy={-size/2 + py * size}
            r={size * 0.09}
            fill="#fff"
          />
        ))
      ) : value === 'Bus' ? (
        <text textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.35} fill="#fff" fontWeight="bold">BUS</text>
      ) : (
        <text textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.3} fill="#fff" fontWeight="bold">MR.M</text>
      )}
    </g>
  );
};

// Corner space renderers with emojis
const renderGoCorner = (size) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
    <g transform={`translate(${size/2}, ${size/2})`}>
      <text y={-size*0.22} textAnchor="middle" fontSize={size*0.16} fill="#e74c3c" fontWeight="bold">GO</text>
      <text y={size*0.05} textAnchor="middle" fontSize={size*0.25}>{">"}</text>
      <text y={size*0.32} textAnchor="middle" fontSize={size*0.1} fill={TILE_COLORS.price} fontWeight="bold">COLLECT $200</text>
    </g>
  </g>
);

const renderJailCorner = (size) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>

    {/* Just Visiting section - bottom left */}
    <g>
      <path
        d={`M0,${size} L0,${size*0.35} L${size*0.35},${size} Z`}
        fill={TILE_COLORS.background}
        stroke={TILE_COLORS.border}
        strokeWidth="2"
      />
      <text
        x={size*0.08}
        y={size*0.78}
        fontSize={size*0.07}
        fill={TILE_COLORS.text}
        fontWeight="bold"
        transform={`rotate(-45, ${size*0.08}, ${size*0.78})`}
      >
        JUST
      </text>
      <text
        x={size*0.14}
        y={size*0.9}
        fontSize={size*0.07}
        fill={TILE_COLORS.text}
        fontWeight="bold"
        transform={`rotate(-45, ${size*0.14}, ${size*0.9})`}
      >
        VISITING
      </text>
    </g>

    {/* Jail cell */}
    <g transform={`translate(${size*0.32}, ${size*0.08})`}>
      <rect
        width={size*0.6}
        height={size*0.55}
        fill="#2d2d2d"
        stroke="#555"
        strokeWidth="3"
        rx="3"
      />
      {/* Bars */}
      {[0.18, 0.38, 0.58, 0.78].map((xPos, i) => (
        <line
          key={i}
          x1={size*0.6*xPos}
          y1={0}
          x2={size*0.6*xPos}
          y2={size*0.55}
          stroke="#888"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
      <text x={size*0.3} y={size*0.32} textAnchor="middle" fontSize={size*0.1} fill="#f59e0b" fontWeight="bold">
        IN JAIL
      </text>
    </g>
  </g>
);

const renderFreeParkingCorner = (size, potAmount = 0) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
    <g transform={`translate(${size/2}, ${size/2})`}>
      <text y={-size*0.28} textAnchor="middle" fontSize={size*0.1} fill={TILE_COLORS.text} fontWeight="bold">FREE</text>
      <text y={-size*0.14} textAnchor="middle" fontSize={size*0.1} fill={TILE_COLORS.text} fontWeight="bold">PARKING</text>
      <text y={size*0.12} textAnchor="middle" fontSize={size*0.28}>P</text>
      {potAmount > 0 && (
        <text y={size*0.36} textAnchor="middle" fontSize={size*0.11} fill={TILE_COLORS.price} fontWeight="bold">${potAmount}</text>
      )}
    </g>
  </g>
);

const renderGoToJailCorner = (size) => (
  <g>
    <rect width={size} height={size} fill={TILE_COLORS.backgroundCorner} stroke={TILE_COLORS.border} strokeWidth="2" rx="4"/>
    <g transform={`translate(${size/2}, ${size/2})`}>
      <text y={-size*0.28} textAnchor="middle" fontSize={size*0.1} fill={TILE_COLORS.text} fontWeight="bold">GO TO</text>
      <text y={-size*0.14} textAnchor="middle" fontSize={size*0.1} fill={TILE_COLORS.text} fontWeight="bold">JAIL</text>
      <text y={size*0.18} textAnchor="middle" fontSize={size*0.3}>X</text>
    </g>
  </g>
);

export default function Board2D({
  gameState,
  onPropertyClick,
  onRollDice,
  isMyTurn = false,
  canRoll = false,
  myPlayerId = null,
  socket = null,
  gameId = null
}) {
  const containerRef = useRef(null);
  const [boardSize, setBoardSize] = useState(950);
  const [isRolling, setIsRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState(gameState?.dice || [1, 1]);
  const [showDebugMenu, setShowDebugMenu] = useState(false);

  // Responsive sizing - even bigger
  useEffect(() => {
    const updateSize = () => {
      const container = document.querySelector('.game-center');
      if (container) {
        const maxSize = Math.min(container.clientWidth - 20, container.clientHeight - 20, 1050);
        setBoardSize(Math.max(maxSize, 750));
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update display dice when gameState changes
  useEffect(() => {
    if (gameState?.dice && !isRolling) {
      setDisplayDice(gameState.dice);
    }
  }, [gameState?.dice, isRolling]);

  // Scaled dimensions - bigger proportions
  const woodBorderWidth = Math.round(boardSize * 0.022);
  const cornerSize = Math.round(boardSize * 0.135);
  const colorBarHeight = Math.round(boardSize * 0.032);
  const sideSpaces = 9;
  const spaceWidth = Math.floor((boardSize - 2 * cornerSize - 2 * woodBorderWidth) / sideSpaces);
  const innerBoardStart = cornerSize + woodBorderWidth;
  const innerBoardSize = boardSize - 2 * cornerSize - 2 * woodBorderWidth;
  const fontSize = Math.round(boardSize * 0.012);
  const priceFontSize = Math.round(boardSize * 0.014);

  // Calculate position for each space
  const getSpacePosition = (position) => {
    const offset = woodBorderWidth;

    if (position === 0) {
      // GO corner (bottom right)
      return { x: boardSize - cornerSize - offset, y: boardSize - cornerSize - offset, w: cornerSize, h: cornerSize, side: 'corner' };
    } else if (position > 0 && position < 10) {
      // Bottom row (left of GO)
      return {
        x: boardSize - cornerSize - offset - (position * spaceWidth),
        y: boardSize - cornerSize - offset,
        w: spaceWidth,
        h: cornerSize,
        side: 'bottom'
      };
    } else if (position === 10) {
      // Jail corner (bottom left)
      return { x: offset, y: boardSize - cornerSize - offset, w: cornerSize, h: cornerSize, side: 'corner' };
    } else if (position > 10 && position < 20) {
      // Left column (going up)
      const idx = position - 10;
      return {
        x: offset,
        y: boardSize - cornerSize - offset - (idx * spaceWidth),
        w: cornerSize,
        h: spaceWidth,
        side: 'left'
      };
    } else if (position === 20) {
      // Free Parking corner (top left)
      return { x: offset, y: offset, w: cornerSize, h: cornerSize, side: 'corner' };
    } else if (position > 20 && position < 30) {
      // Top row (going right)
      const idx = position - 20;
      return {
        x: cornerSize + offset + ((idx - 1) * spaceWidth),
        y: offset,
        w: spaceWidth,
        h: cornerSize,
        side: 'top'
      };
    } else if (position === 30) {
      // Go To Jail corner (top right)
      return { x: boardSize - cornerSize - offset, y: offset, w: cornerSize, h: cornerSize, side: 'corner' };
    } else {
      // Right column (going down)
      const idx = position - 30;
      return {
        x: boardSize - cornerSize - offset,
        y: cornerSize + offset + ((idx - 1) * spaceWidth),
        w: cornerSize,
        h: spaceWidth,
        side: 'right'
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

  // Handle dice roll with animation
  const handleRollDice = async () => {
    if (!canRoll || isRolling) return;

    setIsRolling(true);

    const animationDuration = 1000;
    const frameInterval = 100;
    let elapsed = 0;

    const animateInterval = setInterval(() => {
      setDisplayDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
      elapsed += frameInterval;

      if (elapsed >= animationDuration) {
        clearInterval(animateInterval);
      }
    }, frameInterval);

    if (onRollDice) {
      try {
        await onRollDice();
      } finally {
        setTimeout(() => {
          setIsRolling(false);
        }, animationDuration);
      }
    } else {
      setTimeout(() => {
        setIsRolling(false);
      }, animationDuration);
    }
  };

  // Debug functions
  const handleDebugAddCash = async (amount) => {
    if (socket && gameId) {
      try {
        await socket.emit('debugAddCash', { gameId, amount });
      } catch (err) {
        console.error('Debug add cash failed:', err);
      }
    }
  };

  const handleDebugAddProperty = async (propertyId) => {
    if (socket && gameId) {
      try {
        await socket.emit('debugAddProperty', { gameId, propertyId });
      } catch (err) {
        console.error('Debug add property failed:', err);
      }
    }
  };

  // Render property tile for bottom row (color bar on top, price at bottom)
  const renderBottomTile = (space, pos, propertyState) => {
    const color = ENHANCED_COLORS[space.color] || COLOR_MAP[space.color];
    const nameParts = space.name.toUpperCase().split(' ');

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>

        {/* Color bar at top */}
        {space.color && (
          <rect x={0} y={0} width={pos.w} height={colorBarHeight} fill={color} rx="3 3 0 0"/>
        )}

        {/* Name - centered */}
        <text
          x={pos.w / 2}
          y={colorBarHeight + fontSize * 1.8}
          textAnchor="middle"
          fontSize={fontSize}
          fill={TILE_COLORS.text}
          fontWeight="600"
        >
          {nameParts[0]}
        </text>
        {nameParts.length > 1 && (
          <text
            x={pos.w / 2}
            y={colorBarHeight + fontSize * 3}
            textAnchor="middle"
            fontSize={fontSize}
            fill={TILE_COLORS.text}
            fontWeight="600"
          >
            {nameParts.slice(1).join(' ').substring(0, 10)}
          </text>
        )}

        {/* Price at bottom */}
        {space.price && (
          <text
            x={pos.w / 2}
            y={pos.h - fontSize}
            textAnchor="middle"
            fontSize={priceFontSize}
            fill={TILE_COLORS.price}
            fontWeight="bold"
          >
            ${space.price}
          </text>
        )}

        {/* Buildings */}
        {renderBuildings(propertyState, pos, 'bottom')}

        {/* Owner indicator */}
        {renderOwnerBorder(propertyState, pos)}

        {/* Mortgaged */}
        {renderMortgaged(propertyState, pos)}
      </g>
    );
  };

  // Render property tile for top row (mirrored - color bar at bottom, price at top)
  const renderTopTile = (space, pos, propertyState) => {
    const color = ENHANCED_COLORS[space.color] || COLOR_MAP[space.color];
    const nameParts = space.name.toUpperCase().split(' ');

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>

        {/* Color bar at bottom */}
        {space.color && (
          <rect x={0} y={pos.h - colorBarHeight} width={pos.w} height={colorBarHeight} fill={color} rx="0 0 3 3"/>
        )}

        {/* Price at top */}
        {space.price && (
          <text
            x={pos.w / 2}
            y={fontSize * 1.5}
            textAnchor="middle"
            fontSize={priceFontSize}
            fill={TILE_COLORS.price}
            fontWeight="bold"
          >
            ${space.price}
          </text>
        )}

        {/* Name - centered */}
        <text
          x={pos.w / 2}
          y={pos.h / 2 - fontSize * 0.3}
          textAnchor="middle"
          fontSize={fontSize}
          fill={TILE_COLORS.text}
          fontWeight="600"
        >
          {nameParts[0]}
        </text>
        {nameParts.length > 1 && (
          <text
            x={pos.w / 2}
            y={pos.h / 2 + fontSize * 1}
            textAnchor="middle"
            fontSize={fontSize}
            fill={TILE_COLORS.text}
            fontWeight="600"
          >
            {nameParts.slice(1).join(' ').substring(0, 10)}
          </text>
        )}

        {/* Buildings */}
        {renderBuildings(propertyState, pos, 'top')}

        {/* Owner indicator */}
        {renderOwnerBorder(propertyState, pos)}

        {/* Mortgaged */}
        {renderMortgaged(propertyState, pos)}
      </g>
    );
  };

  // Render property tile for left column (rotated - color bar on right, text horizontal)
  const renderLeftTile = (space, pos, propertyState) => {
    const color = ENHANCED_COLORS[space.color] || COLOR_MAP[space.color];
    const nameParts = space.name.toUpperCase().split(' ');

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>

        {/* Color bar on right side */}
        {space.color && (
          <rect x={pos.w - colorBarHeight} y={0} width={colorBarHeight} height={pos.h} fill={color} rx="0 3 3 0"/>
        )}

        {/* Content area - rotated text to read from outside */}
        <g transform={`translate(${pos.w/2 - colorBarHeight/2}, ${pos.h/2}) rotate(-90)`}>
          {/* Name */}
          <text
            x={0}
            y={-fontSize * 0.5}
            textAnchor="middle"
            fontSize={fontSize}
            fill={TILE_COLORS.text}
            fontWeight="600"
          >
            {nameParts[0]}
          </text>
          {nameParts.length > 1 && (
            <text
              x={0}
              y={fontSize * 0.8}
              textAnchor="middle"
              fontSize={fontSize}
              fill={TILE_COLORS.text}
              fontWeight="600"
            >
              {nameParts.slice(1).join(' ').substring(0, 10)}
            </text>
          )}

          {/* Price */}
          {space.price && (
            <text
              x={0}
              y={fontSize * 2.3}
              textAnchor="middle"
              fontSize={priceFontSize}
              fill={TILE_COLORS.price}
              fontWeight="bold"
            >
              ${space.price}
            </text>
          )}
        </g>

        {/* Buildings */}
        {renderBuildings(propertyState, pos, 'left')}

        {/* Owner indicator */}
        {renderOwnerBorder(propertyState, pos)}

        {/* Mortgaged */}
        {renderMortgaged(propertyState, pos)}
      </g>
    );
  };

  // Render property tile for right column (rotated - color bar on left, text horizontal)
  const renderRightTile = (space, pos, propertyState) => {
    const color = ENHANCED_COLORS[space.color] || COLOR_MAP[space.color];
    const nameParts = space.name.toUpperCase().split(' ');

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>

        {/* Color bar on left side */}
        {space.color && (
          <rect x={0} y={0} width={colorBarHeight} height={pos.h} fill={color} rx="3 0 0 3"/>
        )}

        {/* Content area - rotated text to read from outside */}
        <g transform={`translate(${pos.w/2 + colorBarHeight/2}, ${pos.h/2}) rotate(90)`}>
          {/* Name */}
          <text
            x={0}
            y={-fontSize * 0.5}
            textAnchor="middle"
            fontSize={fontSize}
            fill={TILE_COLORS.text}
            fontWeight="600"
          >
            {nameParts[0]}
          </text>
          {nameParts.length > 1 && (
            <text
              x={0}
              y={fontSize * 0.8}
              textAnchor="middle"
              fontSize={fontSize}
              fill={TILE_COLORS.text}
              fontWeight="600"
            >
              {nameParts.slice(1).join(' ').substring(0, 10)}
            </text>
          )}

          {/* Price */}
          {space.price && (
            <text
              x={0}
              y={fontSize * 2.3}
              textAnchor="middle"
              fontSize={priceFontSize}
              fill={TILE_COLORS.price}
              fontWeight="bold"
            >
              ${space.price}
            </text>
          )}
        </g>

        {/* Buildings */}
        {renderBuildings(propertyState, pos, 'right')}

        {/* Owner indicator */}
        {renderOwnerBorder(propertyState, pos)}

        {/* Mortgaged */}
        {renderMortgaged(propertyState, pos)}
      </g>
    );
  };

  // Render special space (chance, community chest, tax) for bottom
  const renderSpecialBottom = (space, pos) => {
    let emoji = '';
    let label1 = '';
    let label2 = '';

    if (space.type === 'chance') {
      emoji = '?';
      label1 = 'CHANCE';
    } else if (space.type === 'community_chest') {
      emoji = '$';
      label1 = 'COMMUNITY';
      label2 = 'CHEST';
    } else if (space.type === 'tax') {
      emoji = '$';
      label1 = space.name.toUpperCase();
      label2 = `$${space.amount}`;
    }

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
        <text x={pos.w/2} y={fontSize * 1.8} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">
          {label1}
        </text>
        {label2 && (
          <text x={pos.w/2} y={fontSize * 3} textAnchor="middle" fontSize={space.type === 'tax' ? priceFontSize : fontSize} fill={space.type === 'tax' ? TILE_COLORS.price : TILE_COLORS.text} fontWeight="bold">
            {label2}
          </text>
        )}
        <text x={pos.w/2} y={pos.h - fontSize * 1.5} textAnchor="middle" fontSize={pos.h * 0.25} fill={space.type === 'chance' ? '#f39c12' : '#3498db'}>
          {emoji}
        </text>
      </g>
    );
  };

  // Render special space for top (mirrored)
  const renderSpecialTop = (space, pos) => {
    let emoji = '';
    let label1 = '';
    let label2 = '';

    if (space.type === 'chance') {
      emoji = '?';
      label1 = 'CHANCE';
    } else if (space.type === 'community_chest') {
      emoji = '$';
      label1 = 'COMMUNITY';
      label2 = 'CHEST';
    } else if (space.type === 'tax') {
      emoji = '$';
      label1 = space.name.toUpperCase();
      label2 = `$${space.amount}`;
    }

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
        <text x={pos.w/2} y={fontSize * 1.5} textAnchor="middle" fontSize={pos.h * 0.25} fill={space.type === 'chance' ? '#f39c12' : '#3498db'}>
          {emoji}
        </text>
        <text x={pos.w/2} y={pos.h - fontSize * 2.5} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">
          {label1}
        </text>
        {label2 && (
          <text x={pos.w/2} y={pos.h - fontSize} textAnchor="middle" fontSize={space.type === 'tax' ? priceFontSize : fontSize} fill={space.type === 'tax' ? TILE_COLORS.price : TILE_COLORS.text} fontWeight="bold">
            {label2}
          </text>
        )}
      </g>
    );
  };

  // Render special space for left side (rotated)
  const renderSpecialLeft = (space, pos) => {
    let emoji = '';
    let label1 = '';
    let label2 = '';

    if (space.type === 'chance') {
      emoji = '?';
      label1 = 'CHANCE';
    } else if (space.type === 'community_chest') {
      emoji = '$';
      label1 = 'COMMUNITY';
      label2 = 'CHEST';
    } else if (space.type === 'tax') {
      emoji = '$';
      label1 = space.name.toUpperCase();
      label2 = `$${space.amount}`;
    }

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
        <g transform={`translate(${pos.w/2}, ${pos.h/2}) rotate(-90)`}>
          <text x={-pos.h * 0.25} y={-fontSize * 0.3} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">
            {label1}
          </text>
          {label2 && (
            <text x={-pos.h * 0.25} y={fontSize * 1} textAnchor="middle" fontSize={space.type === 'tax' ? priceFontSize : fontSize} fill={space.type === 'tax' ? TILE_COLORS.price : TILE_COLORS.text} fontWeight="bold">
              {label2}
            </text>
          )}
          <text x={pos.h * 0.2} y={fontSize * 0.5} textAnchor="middle" fontSize={pos.w * 0.35} fill={space.type === 'chance' ? '#f39c12' : '#3498db'}>
            {emoji}
          </text>
        </g>
      </g>
    );
  };

  // Render special space for right side (rotated)
  const renderSpecialRight = (space, pos) => {
    let emoji = '';
    let label1 = '';
    let label2 = '';

    if (space.type === 'chance') {
      emoji = '?';
      label1 = 'CHANCE';
    } else if (space.type === 'community_chest') {
      emoji = '$';
      label1 = 'COMMUNITY';
      label2 = 'CHEST';
    } else if (space.type === 'tax') {
      emoji = '$';
      label1 = space.name.toUpperCase();
      label2 = `$${space.amount}`;
    }

    return (
      <g>
        <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
        <g transform={`translate(${pos.w/2}, ${pos.h/2}) rotate(90)`}>
          <text x={-pos.h * 0.25} y={-fontSize * 0.3} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">
            {label1}
          </text>
          {label2 && (
            <text x={-pos.h * 0.25} y={fontSize * 1} textAnchor="middle" fontSize={space.type === 'tax' ? priceFontSize : fontSize} fill={space.type === 'tax' ? TILE_COLORS.price : TILE_COLORS.text} fontWeight="bold">
              {label2}
            </text>
          )}
          <text x={pos.h * 0.2} y={fontSize * 0.5} textAnchor="middle" fontSize={pos.w * 0.35} fill={space.type === 'chance' ? '#f39c12' : '#3498db'}>
            {emoji}
          </text>
        </g>
      </g>
    );
  };

  // Render railroad for each side
  const renderRailroad = (space, pos, side) => {
    const nameParts = space.name.toUpperCase().split(' ');
    const firstWord = nameParts[0];

    if (side === 'bottom') {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
          <text x={pos.w/2} y={fontSize * 1.8} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{firstWord}</text>
          <text x={pos.w/2} y={fontSize * 3} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">RAILROAD</text>
          <text x={pos.w/2} y={pos.h * 0.6} textAnchor="middle" fontSize={pos.h * 0.22}>T</text>
          <text x={pos.w/2} y={pos.h - fontSize} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$200</text>
        </g>
      );
    } else if (side === 'top') {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
          <text x={pos.w/2} y={fontSize * 1.5} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$200</text>
          <text x={pos.w/2} y={pos.h * 0.45} textAnchor="middle" fontSize={pos.h * 0.22}>T</text>
          <text x={pos.w/2} y={pos.h - fontSize * 2.5} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{firstWord}</text>
          <text x={pos.w/2} y={pos.h - fontSize} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">RAILROAD</text>
        </g>
      );
    } else if (side === 'left') {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
          <g transform={`translate(${pos.w/2}, ${pos.h/2}) rotate(-90)`}>
            <text x={-pos.h * 0.25} y={-fontSize * 0.3} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{firstWord}</text>
            <text x={-pos.h * 0.25} y={fontSize * 1} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">RAILROAD</text>
            <text x={pos.h * 0.15} y={fontSize * 0.5} textAnchor="middle" fontSize={pos.w * 0.3}>T</text>
            <text x={pos.h * 0.35} y={fontSize * 0.5} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$200</text>
          </g>
        </g>
      );
    } else {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
          <g transform={`translate(${pos.w/2}, ${pos.h/2}) rotate(90)`}>
            <text x={-pos.h * 0.25} y={-fontSize * 0.3} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{firstWord}</text>
            <text x={-pos.h * 0.25} y={fontSize * 1} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">RAILROAD</text>
            <text x={pos.h * 0.15} y={fontSize * 0.5} textAnchor="middle" fontSize={pos.w * 0.3}>T</text>
            <text x={pos.h * 0.35} y={fontSize * 0.5} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$200</text>
          </g>
        </g>
      );
    }
  };

  // Render utility for each side
  const renderUtility = (space, pos, side) => {
    const isElectric = space.id === 12;
    const emoji = isElectric ? 'E' : 'W';
    const name1 = isElectric ? 'ELECTRIC' : 'WATER';
    const name2 = isElectric ? 'COMPANY' : 'WORKS';

    if (side === 'bottom') {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
          <text x={pos.w/2} y={fontSize * 1.8} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{name1}</text>
          <text x={pos.w/2} y={fontSize * 3} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{name2}</text>
          <text x={pos.w/2} y={pos.h * 0.62} textAnchor="middle" fontSize={pos.h * 0.25} fill={isElectric ? '#f1c40f' : '#3498db'}>{emoji}</text>
          <text x={pos.w/2} y={pos.h - fontSize} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$150</text>
        </g>
      );
    } else if (side === 'top') {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
          <text x={pos.w/2} y={fontSize * 1.5} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$150</text>
          <text x={pos.w/2} y={pos.h * 0.45} textAnchor="middle" fontSize={pos.h * 0.25} fill={isElectric ? '#f1c40f' : '#3498db'}>{emoji}</text>
          <text x={pos.w/2} y={pos.h - fontSize * 2.5} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{name1}</text>
          <text x={pos.w/2} y={pos.h - fontSize} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{name2}</text>
        </g>
      );
    } else if (side === 'left') {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
          <g transform={`translate(${pos.w/2}, ${pos.h/2}) rotate(-90)`}>
            <text x={-pos.h * 0.25} y={-fontSize * 0.3} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{name1}</text>
            <text x={-pos.h * 0.25} y={fontSize * 1} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{name2}</text>
            <text x={pos.h * 0.18} y={fontSize * 0.5} textAnchor="middle" fontSize={pos.w * 0.35} fill={isElectric ? '#f1c40f' : '#3498db'}>{emoji}</text>
            <text x={pos.h * 0.38} y={fontSize * 0.5} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$150</text>
          </g>
        </g>
      );
    } else {
      return (
        <g>
          <rect width={pos.w} height={pos.h} fill={TILE_COLORS.background} stroke={TILE_COLORS.border} strokeWidth="1.5" rx="3"/>
          <g transform={`translate(${pos.w/2}, ${pos.h/2}) rotate(90)`}>
            <text x={-pos.h * 0.25} y={-fontSize * 0.3} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{name1}</text>
            <text x={-pos.h * 0.25} y={fontSize * 1} textAnchor="middle" fontSize={fontSize} fill={TILE_COLORS.text} fontWeight="600">{name2}</text>
            <text x={pos.h * 0.18} y={fontSize * 0.5} textAnchor="middle" fontSize={pos.w * 0.35} fill={isElectric ? '#f1c40f' : '#3498db'}>{emoji}</text>
            <text x={pos.h * 0.38} y={fontSize * 0.5} textAnchor="middle" fontSize={priceFontSize} fill={TILE_COLORS.price} fontWeight="bold">$150</text>
          </g>
        </g>
      );
    }
  };

  // Render buildings on color bar
  const renderBuildings = (propertyState, pos, side) => {
    if (!propertyState) return null;

    const hasHotel = propertyState.hotels > 0;
    const houses = propertyState.houses;

    if (!hasHotel && houses === 0) return null;

    const buildingSize = colorBarHeight * 0.7;
    let x, y;

    switch(side) {
      case 'bottom':
        x = pos.w / 2;
        y = colorBarHeight / 2;
        break;
      case 'top':
        x = pos.w / 2;
        y = pos.h - colorBarHeight / 2;
        break;
      case 'left':
        x = pos.w - colorBarHeight / 2;
        y = pos.h / 2;
        break;
      case 'right':
        x = colorBarHeight / 2;
        y = pos.h / 2;
        break;
      default:
        return null;
    }

    if (hasHotel) {
      return (
        <g transform={`translate(${x}, ${y})`}>
          <rect x={-buildingSize} y={-buildingSize/2} width={buildingSize*2} height={buildingSize} fill="#ef4444" stroke="#b91c1c" strokeWidth="1" rx="2"/>
          <text x={0} y={buildingSize*0.25} textAnchor="middle" fontSize={buildingSize*0.7} fill="white" fontWeight="bold">H</text>
        </g>
      );
    }

    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect x={-buildingSize/2} y={-buildingSize/2} width={buildingSize} height={buildingSize} fill="#22c55e" stroke="#15803d" strokeWidth="1" rx="1"/>
        {houses > 1 && (
          <text x={buildingSize} y={buildingSize*0.3} fontSize={buildingSize*0.8} fill="#fff" fontWeight="bold">x{houses}</text>
        )}
      </g>
    );
  };

  // Render owner border
  const renderOwnerBorder = (propertyState, pos) => {
    if (!propertyState?.ownerId) return null;
    const ownerColor = getOwnerColor(propertyState.ownerId);

    return (
      <rect
        x={2}
        y={2}
        width={pos.w - 4}
        height={pos.h - 4}
        fill="none"
        stroke={ownerColor}
        strokeWidth="3"
        rx="2"
        opacity="0.85"
      />
    );
  };

  // Render mortgaged indicator
  const renderMortgaged = (propertyState, pos) => {
    if (!propertyState?.mortgaged) return null;

    return (
      <>
        <rect x={0} y={0} width={pos.w} height={pos.h} fill="rgba(0,0,0,0.6)" rx="3"/>
        <text x={pos.w/2} y={pos.h/2} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize} fill="#ef4444" fontWeight="bold">
          MORTGAGED
        </text>
      </>
    );
  };

  // Render player tokens
  const renderPlayers = (position, pos) => {
    const players = getPlayersOnSpace(position);
    if (players.length === 0) return null;

    const tokenSize = Math.min(pos.w, pos.h) * 0.2;
    const centerX = pos.w / 2;
    const centerY = pos.h / 2;

    const getTokenPosition = (index, total) => {
      if (total === 1) return { x: centerX, y: centerY };
      const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
      const radius = tokenSize * 0.9;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    };

    return players.map((player, idx) => {
      const tokenPos = getTokenPosition(idx, players.length);
      const playerIndex = gameState.players.findIndex(p => p.id === player.id);

      return (
        <g key={player.id} transform={`translate(${tokenPos.x}, ${tokenPos.y})`}>
          {/* Shadow */}
          <ellipse cx={2} cy={tokenSize/2} rx={tokenSize/2} ry={tokenSize/4} fill="rgba(0,0,0,0.4)"/>
          {/* Token circle with gradient */}
          <defs>
            <radialGradient id={`tokenGrad-${player.id}`} cx="30%" cy="30%">
              <stop offset="0%" stopColor={player.color} stopOpacity="1"/>
              <stop offset="70%" stopColor={player.color} stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#000" stopOpacity="0.3"/>
            </radialGradient>
          </defs>
          <circle
            cx={0}
            cy={0}
            r={tokenSize/2}
            fill={`url(#tokenGrad-${player.id})`}
            stroke="#222"
            strokeWidth="2"
          />
          {/* Highlight */}
          <ellipse cx={-tokenSize/6} cy={-tokenSize/6} rx={tokenSize/5} ry={tokenSize/6} fill="rgba(255,255,255,0.3)"/>

          {/* Player number */}
          <text x={0} y={4} textAnchor="middle" fontSize={tokenSize*0.6} fill="#fff" fontWeight="bold">
            {playerIndex + 1}
          </text>

          {/* In jail indicator */}
          {player.inJail && position === 10 && (
            <text x={0} y={-tokenSize/2 - 4} textAnchor="middle" fontSize={fontSize * 0.8} fill="#ef4444" fontWeight="bold">
              JAIL
            </text>
          )}
        </g>
      );
    });
  };

  // Render a complete space based on its position and type
  const renderSpace = (space, pos) => {
    const propertyState = getPropertyState(space);
    const side = pos.side;

    // Corners handled separately
    if (side === 'corner') {
      switch(space.position) {
        case 0: return renderGoCorner(pos.w);
        case 10: return renderJailCorner(pos.w);
        case 20: return renderFreeParkingCorner(pos.w, gameState.freeParkingPot || 0);
        case 30: return renderGoToJailCorner(pos.w);
        default: return null;
      }
    }

    // Special spaces
    if (space.type === 'chance' || space.type === 'community_chest' || space.type === 'tax') {
      switch(side) {
        case 'bottom': return renderSpecialBottom(space, pos);
        case 'top': return renderSpecialTop(space, pos);
        case 'left': return renderSpecialLeft(space, pos);
        case 'right': return renderSpecialRight(space, pos);
        default: return null;
      }
    }

    // Railroads
    if (space.type === 'railroad') {
      return renderRailroad(space, pos, side);
    }

    // Utilities
    if (space.type === 'utility') {
      return renderUtility(space, pos, side);
    }

    // Properties
    switch(side) {
      case 'bottom': return renderBottomTile(space, pos, propertyState);
      case 'top': return renderTopTile(space, pos, propertyState);
      case 'left': return renderLeftTile(space, pos, propertyState);
      case 'right': return renderRightTile(space, pos, propertyState);
      default: return null;
    }
  };

  // Get current player for turn display
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Debug menu
  const renderDebugMenu = () => {
    if (!showDebugMenu) return null;

    const myPlayer = gameState.players.find(p => p.id === myPlayerId);
    const unownedProperties = BOARD_SPACES.filter(s =>
      (s.type === 'property' || s.type === 'railroad' || s.type === 'utility') &&
      !gameState.properties[s.id]?.ownerId
    );

    return (
      <div className="debug-menu">
        <div className="debug-menu-header">
          <h3>Debug Menu</h3>
          <button onClick={() => setShowDebugMenu(false)}>x</button>
        </div>
        <div className="debug-menu-content">
          <div className="debug-section">
            <h4>Add Cash</h4>
            <div className="debug-buttons">
              <button onClick={() => handleDebugAddCash(100)}>+$100</button>
              <button onClick={() => handleDebugAddCash(500)}>+$500</button>
              <button onClick={() => handleDebugAddCash(1000)}>+$1000</button>
              <button onClick={() => handleDebugAddCash(5000)}>+$5000</button>
            </div>
          </div>
          <div className="debug-section">
            <h4>Quick Add Properties</h4>
            <div className="debug-property-list">
              {unownedProperties.slice(0, 10).map(prop => (
                <button key={prop.id} onClick={() => handleDebugAddProperty(prop.id)} className="debug-property-btn">
                  {prop.name.substring(0, 18)}
                </button>
              ))}
            </div>
          </div>
          <div className="debug-section">
            <h4>Current State</h4>
            <div className="debug-info">
              <p>Phase: {gameState.phase}</p>
              <p>Current Player: {currentPlayer?.name}</p>
              <p>My Cash: ${myPlayer?.cash || 0}</p>
              <p>Has Rolled: {gameState.hasRolledThisTurn ? 'Yes' : 'No'}</p>
              <p>Can Roll Again: {gameState.canRollAgain ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="board-2d" ref={containerRef} style={{ position: 'relative' }}>
      <svg
        width={boardSize}
        height={boardSize}
        viewBox={`0 0 ${boardSize} ${boardSize}`}
        style={{
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '8px',
        }}
      >
        {/* Definitions */}
        <defs>
          {/* Wood grain pattern - darker */}
          <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="100" height="100">
            <rect width="100" height="100" fill={WOOD_COLORS.medium}/>
            <path d="M0,10 Q25,5 50,10 T100,10" stroke={WOOD_COLORS.grain1} strokeWidth="2" fill="none" opacity="0.5"/>
            <path d="M0,30 Q25,25 50,30 T100,30" stroke={WOOD_COLORS.grain2} strokeWidth="1.5" fill="none" opacity="0.4"/>
            <path d="M0,50 Q25,45 50,50 T100,50" stroke={WOOD_COLORS.grain1} strokeWidth="2" fill="none" opacity="0.5"/>
            <path d="M0,70 Q25,65 50,70 T100,70" stroke={WOOD_COLORS.grain2} strokeWidth="1.5" fill="none" opacity="0.4"/>
            <path d="M0,90 Q25,85 50,90 T100,90" stroke={WOOD_COLORS.grain1} strokeWidth="2" fill="none" opacity="0.5"/>
          </pattern>

          {/* Board center gradient */}
          <linearGradient id="boardBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a4a2e" />
            <stop offset="50%" stopColor="#0f3020" />
            <stop offset="100%" stopColor="#1a4a2e" />
          </linearGradient>

          {/* Dice gradient */}
          <linearGradient id="diceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e8e8e8" />
          </linearGradient>

          <filter id="dropShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.4"/>
          </filter>
        </defs>

        {/* Outer wood border */}
        <rect
          x="0"
          y="0"
          width={boardSize}
          height={boardSize}
          fill="url(#woodGrain)"
          rx="8"
        />

        {/* Dark edge on wood */}
        <rect
          x="0"
          y="0"
          width={boardSize}
          height={boardSize}
          fill="none"
          stroke={WOOD_COLORS.dark}
          strokeWidth="4"
          rx="8"
        />

        {/* Inner wood border (between properties and green center) */}
        <rect
          x={innerBoardStart}
          y={innerBoardStart}
          width={innerBoardSize}
          height={innerBoardSize}
          fill="url(#woodGrain)"
          stroke={WOOD_COLORS.dark}
          strokeWidth="3"
        />

        {/* Green center */}
        <rect
          x={innerBoardStart + woodBorderWidth}
          y={innerBoardStart + woodBorderWidth}
          width={innerBoardSize - 2 * woodBorderWidth}
          height={innerBoardSize - 2 * woodBorderWidth}
          fill="url(#boardBg)"
        />

        {/* Center area content */}
        <g transform={`translate(${boardSize/2}, ${boardSize/2})`}>
          {/* Monopoly logo - bigger */}
          <text
            textAnchor="middle"
            y={-boardSize * 0.13}
            fontSize={boardSize * 0.065}
            fontWeight="bold"
            fill="#f59e0b"
            fontFamily="'Playfair Display', Georgia, serif"
            letterSpacing="6"
          >
            MONOPOLY
          </text>

          {/* Dice area */}
          <g transform="translate(0, 10)">
            {/* Dice */}
            <g transform="translate(-40, -30)">
              <DiceFace value={displayDice[0]} size={60} isRolling={isRolling} />
            </g>
            <g transform="translate(40, -30)">
              <DiceFace value={displayDice[1]} size={60} isRolling={isRolling} />
            </g>

            {/* Speed die (if enabled) */}
            {gameState.settings?.speedDie && gameState.speedDie && (
              <g transform="translate(0, 50)">
                <SpeedDieFace value={gameState.speedDie} size={45} />
              </g>
            )}

            {/* Roll button */}
            {canRoll && isMyTurn && (
              <g
                transform="translate(0, 70)"
                onClick={handleRollDice}
                style={{ cursor: 'pointer' }}
                className="roll-button"
              >
                <rect
                  x="-60"
                  y="-18"
                  width="120"
                  height="36"
                  fill="#f59e0b"
                  stroke="#d97706"
                  strokeWidth="2"
                  rx="18"
                  filter="url(#dropShadow)"
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="16"
                  fill="#1a1a1a"
                  fontWeight="bold"
                >
                  {isRolling ? 'Rolling...' : 'Roll Dice'}
                </text>
              </g>
            )}
          </g>

          {/* Current player indicator */}
          <g transform="translate(0, 130)">
            <rect
              x="-110"
              y="-18"
              width="220"
              height="36"
              fill="rgba(0, 0, 0, 0.4)"
              rx="18"
              stroke={TILE_COLORS.border}
              strokeWidth="1"
            />
            <circle cx="-80" cy="0" r="10" fill={currentPlayer?.color || '#666'}/>
            <text
              x="5"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="15"
              fill={TILE_COLORS.text}
              fontWeight="600"
            >
              {currentPlayer?.name}'s Turn
            </text>
          </g>
        </g>

        {/* Board spaces */}
        {BOARD_SPACES.map((space) => {
          const pos = getSpacePosition(space.position);

          return (
            <g
              key={space.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onClick={() => onPropertyClick && onPropertyClick(space.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Render the space */}
              {renderSpace(space, pos)}

              {/* Players on this space */}
              {renderPlayers(space.position, pos)}
            </g>
          );
        })}
      </svg>

      {/* Debug button */}
      <button
        className="debug-button"
        onClick={() => setShowDebugMenu(!showDebugMenu)}
      >
        Debug
      </button>

      {/* Debug menu */}
      {renderDebugMenu()}
    </div>
  );
}
