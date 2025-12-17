import React, { useState } from 'react';
import { getSpaceById, COLOR_MAP } from '../utils/boardData';
import { formatCurrency } from '../utils/formatters';

export default function PropertyCard({ propertyId, gameState, myPlayer, isMyTurn, gameId, socket, onClose }) {
  const [loading, setLoading] = useState(false);
  const space = getSpaceById(propertyId);

  if (!space) {
    return null;
  }

  const property = gameState.properties[propertyId];
  const owner = property && property.ownerId
    ? gameState.players.find(p => p.id === property.ownerId)
    : null;

  const isMyProperty = owner && myPlayer && owner.id === myPlayer.id;

  const handleAction = async (action, data = {}) => {
    if (!socket) return;
    setLoading(true);
    try {
      await socket[action](gameId, ...Object.values(data));
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const canBuildHouse = () => {
    if (!isMyProperty || !isMyTurn || loading) return false;
    if (space.type !== 'property') return false;
    if (property.mortgaged) return false;
    if (property.hotels > 0) return false;
    if (property.houses >= 4) return false;
    if (myPlayer.cash < space.houseCost) return false;
    return true;
  };

  const canBuildHotel = () => {
    if (!isMyProperty || !isMyTurn || loading) return false;
    if (space.type !== 'property') return false;
    if (property.mortgaged) return false;
    if (property.houses !== 4) return false;
    if (property.hotels > 0) return false;
    if (myPlayer.cash < space.hotelCost) return false;
    return true;
  };

  const canMortgage = () => {
    if (!isMyProperty || loading) return false;
    if (property.mortgaged) return false;
    if (property.houses > 0 || property.hotels > 0) return false;
    return true;
  };

  const canUnmortgage = () => {
    if (!isMyProperty || loading) return false;
    if (!property.mortgaged) return false;
    const unmortgageCost = Math.floor(space.mortgageValue * 1.1);
    if (myPlayer.cash < unmortgageCost) return false;
    return true;
  };

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
              <span>4x dice roll</span>
            </div>
            <div className="property-row">
              <span>2 Utilities:</span>
              <span>10x dice roll</span>
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

  const renderActions = () => {
    if (!isMyProperty || !socket) return null;

    const showBuild = canBuildHouse() || canBuildHotel();
    const showMortgage = canMortgage();
    const showUnmortgage = canUnmortgage();

    if (!showBuild && !showMortgage && !showUnmortgage) return null;

    return (
      <div className="property-actions-section">
        <h4>Actions</h4>
        {canBuildHouse() && (
          <button
            className="btn btn-success btn-small"
            onClick={() => handleAction('buildHouse', { propertyId })}
            disabled={loading}
          >
            Build House ({formatCurrency(space.houseCost)})
          </button>
        )}
        {canBuildHotel() && (
          <button
            className="btn btn-success btn-small"
            onClick={() => handleAction('buildHotel', { propertyId })}
            disabled={loading}
          >
            Build Hotel ({formatCurrency(space.hotelCost)})
          </button>
        )}
        {canMortgage() && (
          <button
            className="btn btn-warning btn-small"
            onClick={() => handleAction('mortgage', { propertyId })}
            disabled={loading}
          >
            Mortgage ({formatCurrency(space.mortgageValue)})
          </button>
        )}
        {canUnmortgage() && (
          <button
            className="btn btn-primary btn-small"
            onClick={() => handleAction('unmortgage', { propertyId })}
            disabled={loading}
          >
            Unmortgage ({formatCurrency(Math.floor(space.mortgageValue * 1.1))})
          </button>
        )}
      </div>
    );
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

        {renderActions()}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
