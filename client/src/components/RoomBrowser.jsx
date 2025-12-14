import React, { useState, useEffect } from 'react';

export default function RoomBrowser({ socket, playerName, onJoin, onClose, disabled }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRooms = async () => {
    // Don't show loading spinner on refresh, only on initial load
    if (rooms.length === 0) {
      setLoading(true);
    }

    try {
      const response = await socket.getGamesList();
      setRooms(response.games || []);
      setError(''); // Clear error on success
    } catch (err) {
      // Only show error if it's not a connection issue (those are transient)
      if (err.message !== 'Socket not connected' && err.message !== 'Request timed out') {
        setError('Failed to fetch rooms');
      }
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch with a small delay to ensure socket is ready
    const initialFetch = setTimeout(fetchRooms, 500);

    // Refresh every 5 seconds
    const interval = setInterval(fetchRooms, 5000);
    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, []);

  const handleJoin = (gameId) => {
    if (!disabled) {
      onJoin(gameId);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="room-browser-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="room-browser-header">
          <div className="room-browser-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <h2>Room Browser</h2>
          </div>
          <button className="btn-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="room-browser-content">
          {/* Refresh button */}
          <div className="room-browser-actions">
            <button
              className="btn btn-refresh"
              onClick={fetchRooms}
              disabled={loading}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={loading ? 'spinning' : ''}
              >
                <path d="M23 4v6h-6"/>
                <path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <span className="room-count">
              {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} available
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div className="room-browser-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Room list */}
          <div className="room-list">
            {loading && rooms.length === 0 ? (
              <div className="room-list-empty">
                <div className="loading-spinner"></div>
                <p>Loading rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="room-list-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
                <p>No rooms available</p>
                <span>Click Play to create a new room</span>
              </div>
            ) : (
              rooms.map(room => (
                <div key={room.gameId} className="room-card">
                  <div className="room-info">
                    {/* Room code */}
                    <div className="room-code">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <span>{room.gameId}</span>
                    </div>

                    {/* Host name */}
                    <div className="room-host">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      <span>{room.hostName}</span>
                      <span className="host-badge">Host</span>
                    </div>

                    {/* Player count */}
                    <div className="room-players">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      <span>{room.playerCount} / {room.maxPlayers}</span>
                      <div className="player-dots">
                        {Array.from({ length: room.maxPlayers }, (_, i) => (
                          <span
                            key={i}
                            className={`player-dot ${i < room.playerCount ? 'filled' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Join button */}
                  <button
                    className="btn btn-join"
                    onClick={() => handleJoin(room.gameId)}
                    disabled={disabled || room.playerCount >= room.maxPlayers}
                  >
                    {room.playerCount >= room.maxPlayers ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Full
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                          <polyline points="10 17 15 12 10 7"/>
                          <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        Join
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer hint */}
        {!playerName.trim() && (
          <div className="room-browser-footer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Enter your name to join a room
          </div>
        )}
      </div>
    </div>
  );
}
