import React from 'react';
import {
  GameController,
  Users,
  Buildings,
  ChatCircle,
  ArrowsLeftRight
} from '@phosphor-icons/react';

const tabs = [
  { id: 'board', icon: GameController, label: 'Board' },
  { id: 'properties', icon: Buildings, label: 'Props' },
  { id: 'chat', icon: ChatCircle, label: 'Chat' },
  { id: 'trades', icon: ArrowsLeftRight, label: 'Trades' },
];

export default function MobileNav({
  activeTab,
  onTabChange,
  unreadMessages = 0,
  pendingTrades = 0,
}) {
  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badge =
            tab.id === 'chat' ? unreadMessages :
            tab.id === 'trades' ? pendingTrades :
            0;

          return (
            <button
              key={tab.id}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="nav-icon" weight={isActive ? 'fill' : 'regular'} />
              <span className="nav-label">{tab.label}</span>
              {badge > 0 && (
                <span className="nav-badge" aria-label={`${badge} notifications`}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
