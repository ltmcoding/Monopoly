import React, { useState } from 'react';
import { getSpaceById } from '../utils/boardData';
import { formatCurrency, getPhaseDisplay } from '../utils/formatters';

export default function ActionPanel({ socket, gameId, gameState, myPlayer, isMyTurn, onOpenTrade }) {
  const [loading, setLoading] = useState(false);
  const [selectedPropertyForBuilding, setSelectedPropertyForBuilding] = useState(null);

  if (!myPlayer) return null;

  const handleAction = async (action, data = {}) => {
    setLoading(true);
    try {
      await socket[action](gameId, ...Object.values(data));
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const currentSpace = getSpaceById(myPlayer.position);
  const canBuyProperty = () => {
    if (gameState.phase !== 'buying' || !isMyTurn) return false;
    const space = getSpaceById(myPlayer.position);
    if (!space || !space.price) return false;
    const property = gameState.properties[space.id];
    return !property.ownerId && myPlayer.cash >= space.price;
  };

  const canDeclineProperty = () => {
    return gameState.phase === 'buying' && isMyTurn;
  };

  const canRollDice = () => {
    return gameState.phase === 'rolling' && isMyTurn && !loading;
  };

  const canEndTurn = () => {
    return gameState.phase === 'rolling' && isMyTurn && !loading;
  };

  const canPayJail = () => {
    return myPlayer.inJail && myPlayer.cash >= 50 && isMyTurn;
  };

  const canUseJailCard = () => {
    return myPlayer.inJail && myPlayer.getOutOfJailCards > 0 && isMyTurn;
  };

  const getMyBuildableProperties = () => {
    return myPlayer.properties
      .map(propId => {
        const space = getSpaceById(propId);
        const property = gameState.properties[propId];
        return { space, property, id: propId };
      })
      .filter(({ space, property }) => {
        if (space.type !== 'property') return false;
        if (property.mortgaged) return false;
        if (property.hotels > 0) return false;
        return true;
      });
  };

  const getMortgageableProperties = () => {
    return myPlayer.properties
      .map(propId => {
        const space = getSpaceById(propId);
        const property = gameState.properties[propId];
        return { space, property, id: propId };
      })
      .filter(({ property }) => !property.mortgaged && property.houses === 0 && property.hotels === 0);
  };

  const getUnmortgageableProperties = () => {
    return myPlayer.properties
      .map(propId => {
        const space = getSpaceById(propId);
        const property = gameState.properties[propId];
        return { space, property, id: propId };
      })
      .filter(({ property }) => property.mortgaged);
  };

  return (
    <div className="action-panel">
      <h3>Actions</h3>

      <div className="phase-indicator">
        <strong>Phase:</strong> {getPhaseDisplay(gameState.phase)}
      </div>

      {isMyTurn ? (
        <div className="your-turn-indicator">✓ Your Turn</div>
      ) : (
        <div className="waiting-indicator">
          Waiting for {gameState.players[gameState.currentPlayerIndex]?.name}
        </div>
      )}

      <div className="action-buttons">
        {/* Roll Dice */}
        {canRollDice() && (
          <button
            className="btn btn-primary btn-action"
            onClick={() => handleAction('rollDice')}
            disabled={loading}
          >
            🎲 Roll Dice
          </button>
        )}

        {/* Jail Actions */}
        {myPlayer.inJail && isMyTurn && (
          <>
            {canPayJail() && (
              <button
                className="btn btn-warning btn-action"
                onClick={() => handleAction('payJailFee')}
                disabled={loading}
              >
                Pay $50 to Exit Jail
              </button>
            )}
            {canUseJailCard() && (
              <button
                className="btn btn-success btn-action"
                onClick={() => handleAction('useJailCard')}
                disabled={loading}
              >
                Use Jail Card
              </button>
            )}
          </>
        )}

        {/* Buy Property */}
        {canBuyProperty() && (
          <button
            className="btn btn-success btn-action"
            onClick={() => handleAction('buyProperty', { propertyId: currentSpace.id })}
            disabled={loading}
          >
            Buy {currentSpace.name} ({formatCurrency(currentSpace.price)})
          </button>
        )}

        {/* Decline Property */}
        {canDeclineProperty() && (
          <button
            className="btn btn-secondary btn-action"
            onClick={() => handleAction('declareProperty')}
            disabled={loading}
          >
            Decline Purchase
          </button>
        )}

        {/* Build Houses */}
        {isMyTurn && !myPlayer.inJail && getMyBuildableProperties().length > 0 && (
          <div className="property-actions">
            <h4>Build on Properties:</h4>
            {getMyBuildableProperties().map(({ space, property, id }) => (
              <button
                key={id}
                className="btn btn-small btn-building"
                onClick={() => handleAction('buildHouse', { propertyId: id })}
                disabled={loading}
              >
                Build House on {space.name} ({formatCurrency(space.houseCost)})
                {property.houses > 0 && ` [${property.houses}H]`}
              </button>
            ))}
          </div>
        )}

        {/* Mortgage Properties */}
        {gameState.settings.mortgageMode && getMortgageableProperties().length > 0 && (
          <div className="property-actions">
            <h4>Mortgage:</h4>
            {getMortgageableProperties().map(({ space, id }) => (
              <button
                key={id}
                className="btn btn-small btn-secondary"
                onClick={() => handleAction('mortgage', { propertyId: id })}
                disabled={loading}
              >
                Mortgage {space.name} ({formatCurrency(space.mortgageValue)})
              </button>
            ))}
          </div>
        )}

        {/* Unmortgage Properties */}
        {gameState.settings.mortgageMode && getUnmortgageableProperties().length > 0 && (
          <div className="property-actions">
            <h4>Unmortgage:</h4>
            {getUnmortgageableProperties().map(({ space, id }) => (
              <button
                key={id}
                className="btn btn-small btn-success"
                onClick={() => handleAction('unmortgage', { propertyId: id })}
                disabled={loading}
              >
                Unmortgage {space.name} ({formatCurrency(Math.floor(space.mortgageValue * 1.1))})
              </button>
            ))}
          </div>
        )}

        {/* Trade */}
        <button
          className="btn btn-info btn-action"
          onClick={onOpenTrade}
          disabled={loading || myPlayer.isBankrupt}
        >
          💱 Propose Trade
        </button>

        {/* End Turn */}
        {canEndTurn() && (
          <button
            className="btn btn-primary btn-action"
            onClick={() => handleAction('endTurn')}
            disabled={loading}
          >
            End Turn
          </button>
        )}
      </div>

      {/* Available Buildings */}
      {!gameState.settings.unlimitedProperties && (
        <div className="buildings-available">
          <div>Houses Available: {gameState.availableHouses}</div>
          <div>Hotels Available: {gameState.availableHotels}</div>
        </div>
      )}
    </div>
  );
}
