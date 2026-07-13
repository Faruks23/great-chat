'use client';

import { useState } from 'react';
import { Share2, Monitor, X } from 'lucide-react';

interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSharing: boolean;
  onStartSharing: () => void;
  onStopSharing: () => void;
}

export function ScreenShareModal({
  isOpen,
  onClose,
  isSharing,
  onStartSharing,
  onStopSharing,
}: ScreenShareModalProps) {
  const [activeTab, setActiveTab] = useState<'screens' | 'windows'>('screens');

  const screens = [
    {
      id: 'screen-1',
      name: 'Display 1',
      resolution: '1920 x 1080',
      active: true,
    },
    {
      id: 'screen-2',
      name: 'Display 2',
      resolution: '1366 x 768',
      active: false,
    },
  ];

  const windows = [
    { id: 'window-1', name: 'Visual Studio Code', icon: '< >' },
    { id: 'window-2', name: 'Google Chrome', icon: 'Ⓒ' },
    { id: 'window-3', name: 'Slack', icon: '✦' },
    { id: 'window-4', name: 'Finder', icon: '▦' },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-2xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Share2 size={20} className="text-secondary" />
              <h2 className="text-lg font-semibold">
                {isSharing ? 'Stop Screen Share' : 'Share Your Screen'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isSharing ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <div>
                    <p className="font-semibold text-sm">Currently sharing your screen</p>
                    <p className="text-xs text-muted-foreground">All participants can see your screen</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onStopSharing();
                    onClose();
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-destructive hover:bg-destructive/90 text-white font-medium transition-colors"
                >
                  Stop Sharing
                </button>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-border">
                  <button
                    onClick={() => setActiveTab('screens')}
                    className={`
                      px-4 py-2 font-medium text-sm transition-colors border-b-2
                      ${activeTab === 'screens'
                        ? 'border-secondary text-secondary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    Screens
                  </button>
                  <button
                    onClick={() => setActiveTab('windows')}
                    className={`
                      px-4 py-2 font-medium text-sm transition-colors border-b-2
                      ${activeTab === 'windows'
                        ? 'border-secondary text-secondary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                      }
                    `}
                  >
                    Windows
                  </button>
                </div>

                {/* Screens list */}
                {activeTab === 'screens' && (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {screens.map((screen) => (
                      <button
                        key={screen.id}
                        onClick={() => {
                          onStartSharing();
                          onClose();
                        }}
                        className="w-full p-4 rounded-lg border border-border hover:border-secondary hover:bg-secondary/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0 group-hover:from-secondary/20 group-hover:to-secondary/10 transition-colors">
                            <Monitor size={20} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{screen.name}</p>
                            <p className="text-xs text-muted-foreground">{screen.resolution}</p>
                            {screen.active && (
                              <p className="text-xs text-secondary font-medium">Primary Display</p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Windows list */}
                {activeTab === 'windows' && (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {windows.map((window) => (
                      <button
                        key={window.id}
                        onClick={() => {
                          onStartSharing();
                          onClose();
                        }}
                        className="w-full p-3 rounded-lg border border-border hover:border-secondary hover:bg-secondary/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center flex-shrink-0 group-hover:from-secondary/20 group-hover:to-secondary/10 transition-colors font-semibold text-sm">
                            {window.icon}
                          </div>
                          <p className="font-semibold text-sm">{window.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
