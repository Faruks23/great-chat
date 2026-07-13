'use client';

import { useState } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentUserName: string;
  currentUserAvatar: string;
}

export function ChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserName,
  currentUserAvatar,
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(messages);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: currentUserName,
        avatar: currentUserAvatar,
        message: newMessage,
        timestamp: new Date(),
        isOwn: true,
      };
      setLocalMessages([...localMessages, message]);
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={onClose}
        />
      )}

      {/* Chat panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto
          bg-card border-t border-l border-border rounded-t-2xl lg:rounded-t-none lg:rounded-l-2xl
          flex flex-col transition-all duration-300 z-40
          ${isOpen ? 'h-96 lg:w-80' : 'h-14 lg:w-80'}
          lg:h-full lg:border-l lg:border-t-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-secondary" />
            <h3 className="font-semibold text-sm">Chat</h3>
            <span className="text-xs bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center">
              {localMessages.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages container */}
        {isOpen && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {localMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-muted-foreground text-center">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                localMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={msg.avatar}
                      alt={msg.sender}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className={`flex flex-col gap-1 ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl max-w-xs
                          ${msg.isOwn
                            ? 'bg-secondary text-white rounded-br-none'
                            : 'bg-muted text-foreground rounded-bl-none'
                          }
                        `}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-full bg-input border border-border text-sm outline-none focus:border-secondary transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 rounded-full bg-secondary hover:bg-secondary/90 text-white transition-colors disabled:opacity-50"
                  disabled={!newMessage.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
