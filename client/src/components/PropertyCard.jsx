import React from 'react';
import { getSpaceById, COLOR_MAP } from '../utils/boardData';
import { formatCurrency } from '../utils/formatters';

export default function PropertyCard({ propertyId, gameState, myPlayer, isMyTurn, gameId, onClose }) {
  const space = getSpaceById(propertyId);

  if (!space) {
    return null;
  }

  const property = gameState.properties[propertyId];
  const owner = property && property.ownerId
    ? gameState.players.find(p => p.id === property.ownerId)
    : null;

  const renderPropertyDetails = () => {
    if (space.type === 'property') {
      return (
        <>
          <div className="property-color-bar" style={{ backgroundColor: COLOR_MAP[space.color] }} />

          <div className="property-details">
            <div className="property-row">
              <span>Price:</span>
              <span>{formatCurrency(space.price)}</span>
            </div>

            <div className="rent-section">
              <h4>Rent:</h4>
              <div className="property-row">
                <span>Base Rent:</span>
                <span>{formatCurrency(space.rent[0])}</span>
              </div>
              <div className="property-row">
                <span>With Color Set:</span>
                <span>{formatCurrency(space.rent[1])}</span>
              </div>
              <div className="property-row">
                <span>With 1 House:</span>
                <span>{formatCurrency(space.rent[2])}</span>
              </div>
              <div className="property-row">
                <span>With 2 Houses:</span>
                <span>{formatCurrency(space.rent[3])}</span>
              </div>
              <div className="property-row">
                <span>With 3 Houses:</span>
                <span>{formatCurrency(space.rent[4])}</span>
              </div>
              <div className="property-row">
                <span>With 4 Houses:</span>
                <span>{formatCurrency(space.rent[5])}</span>
              </div>
            </div>

            <div className="property-row">
              <span>House Cost:</span>
              <span>{formatCurrency(space.houseCost)}</span>
            </div>
            <div className="property-row">
              <span>Hotel Cost:</span>
              <span>{formatCurrency(space.hotelCost)}</span>
            </div>
            <div className="property-row">
              <span>Mortgage Value:</span>
              <span>{formatCurrency(space.mortgageValue)}</span>
            </div>
          </div>
        </>
      );
    } else if (space.type === 'railroad') {
      return (
        <div className="property-details">
          <div className="property-row">
            <span>Price:</span>
            <span>{formatCurrency(space.price)}</span>
          </div>
          <div className="rent-section">
            <h4>Rent:</h4>
            <div className="property-row">
              <span>1 Railroad:</span>
              <span>{formatCurrency(25)}</span>
            </div>
            <div className="property-row">
              <span>2 Railroads:</span>
              <span>{formatCurrency(50)}</span>
            </div>
            <div className="property-row">
              <span>3 Railroads:</span>
              <span>{formatCurrency(100)}</span>
            </div>
            <div className="property-row">
              <span>4 Railroads:</span>
              <span>{formatCurrency(200)}</span>
            </div>
          </div>
          <div className="property-row">
            <span>Mortgage Value:</span>
            <span>{formatCurrency(space.mortgageValue)}</span>
          </div>
        </div>
      );
    } else if (space.type === 'utility') {
      return (
        <div className="property-details">
          <div className="property-row">
            <span>Price:</span>
            <span>{formatCurrency(space.price)}</span>
          </div>
          <div className="rent-section">
            <h4>Rent:</h4>
            <div className="property-row">
              <span>1 Utility:</span>
              <span>4× dice roll</span>
            </div>
            <div className="property-row">
              <span>2 Utilities:</span>
              <span>10× dice roll</span>
            </div>
          </div>
          <div className="property-row">
            <span>Mortgage Value:</span>
            <span>{formatCurrency(space.mortgageValue)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content property-card-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h2>{space.name}</h2>

        {owner && (
          <div className="property-owner">
            <span>Owner: </span>
            <span style={{ color: owner.color, fontWeight: 'bold' }}>
              {owner.name}
            </span>
          </div>
        )}

        {!owner && property && (
          <div className="property-owner">
            <span>Unowned</span>
          </div>
        )}

        {property && property.mortgaged && (
          <div className="mortgaged-badge">MORTGAGED</div>
        )}

        {property && (property.houses > 0 || property.hotels > 0) && (
          <div className="buildings-info">
            {property.houses > 0 && <span>Houses: {property.houses}</span>}
            {property.hotels > 0 && <span>Hotels: {property.hotels}</span>}
          </div>
        )}

        {renderPropertyDetails()}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
