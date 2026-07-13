'use client';

import { useState, useEffect } from 'react';
import { Hand, X } from 'lucide-react';

interface HandRaiseNotification {
  id: string;
  name: string;
  avatar: string;
  timestamp: Date;
}

interface HandRaiseIndicatorProps {
  handsRaised: HandRaiseNotification[];
  onLowerHand: (id: string) => void;
  isRaisingHand: boolean;
  onToggleHandRaise: () => void;
}

export function HandRaiseIndicator({
  handsRaised,
  onLowerHand,
  isRaisingHand,
  onToggleHandRaise,
}: HandRaiseIndicatorProps) {
  const [notifications, setNotifications] = useState<HandRaiseNotification[]>([]);

  useEffect(() => {
    setNotifications(handsRaised);
  }, [handsRaised]);

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    onLowerHand(id);
  };

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <>
      {/* Hand raise notifications */}
      <div className="fixed top-4 right-4 z-40 space-y-3 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow-lg flex items-center justify-between gap-3 animate-slide-in"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={notification.avatar}
                  alt={notification.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-1">
                  <Hand size={12} className="text-orange-600" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">{notification.name}</p>
                <p className="text-xs opacity-90">raised their hand</p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Hand raise button with status */}
      <div className="relative group">
        <button
          onClick={onToggleHandRaise}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all
            ${isRaisingHand
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg'
              : 'bg-muted hover:bg-muted/80 text-foreground'
            }
          `}
        >
          <Hand size={18} />
          <span className="hidden sm:inline text-sm">
            {isRaisingHand ? 'Hand Raised' : 'Raise Hand'}
          </span>
        </button>

        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-foreground text-background text-xs py-1 px-3 rounded whitespace-nowrap">
            {isRaisingHand ? 'Lower hand' : 'Request to speak'}
          </div>
        </div>
      </div>
    </>
  );
}
