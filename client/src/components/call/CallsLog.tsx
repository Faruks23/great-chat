'use client';

import { useState } from 'react';
import { Phone, PhoneIncoming, PhoneOff, PhoneMissed, Trash2, User } from 'lucide-react';

export interface CallLogEntry {
  id: string;
  name: string;
  type: 'incoming' | 'outgoing' | 'missed';
  duration: number;
  date: Date;
  status: 'completed' | 'missed' | 'rejected';
  phoneNumber?: string;
  avatar?: string;
}

interface CallsLogProps {
  calls?: CallLogEntry[];
  onCallClick?: (call: CallLogEntry) => void;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '0s';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function CallsLog({ calls = mockCalls, onCallClick }: CallsLogProps) {
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const [localCalls, setLocalCalls] = useState(calls);

  const handleDeleteCall = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalCalls(localCalls.filter((call) => call.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all call history?')) {
      setLocalCalls([]);
    }
  };

  const getCallIcon = (type: 'incoming' | 'outgoing' | 'missed') => {
    switch (type) {
      case 'incoming':
        return <PhoneIncoming className="h-5 w-5 text-green-500" />;
      case 'outgoing':
        return <Phone className="h-5 w-5 text-blue-500" />;
      case 'missed':
        return <PhoneMissed className="h-5 w-5 text-red-500" />;
    }
  };

  const getCallTypeLabel = (type: 'incoming' | 'outgoing' | 'missed') => {
    switch (type) {
      case 'incoming':
        return 'Incoming';
      case 'outgoing':
        return 'Outgoing';
      case 'missed':
        return 'Missed';
    }
  };

  const groupedCalls = localCalls.reduce(
    (acc, call) => {
      const dateKey = call.date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(call);
      return acc;
    },
    {} as Record<string, CallLogEntry[]>
  );

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Call History</h1>
            <p className="mt-1 text-sm text-slate-400">{localCalls.length} total calls</p>
          </div>
          {localCalls.length > 0 && (
            <button
              onClick={handleClearAll}
              className="rounded-lg bg-red-900/20 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-900/40"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto">
        {localCalls.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 mx-auto">
                <Phone className="h-8 w-8 text-slate-600" />
              </div>
              <p className="text-lg font-semibold text-slate-300">No calls yet</p>
              <p className="mt-1 text-sm text-slate-500">Your call history will appear here</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {Object.entries(groupedCalls).map(([dateKey, dateCalls]) => (
              <div key={dateKey}>
                {/* Date Separator */}
                <div className="sticky top-0 bg-slate-900/80 px-6 py-3 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{dateKey}</p>
                </div>

                {/* Calls for this date */}
                {dateCalls.map((call) => (
                  <div
                    key={call.id}
                    onClick={() => {
                      setSelectedCall(call.id);
                      onCallClick?.(call);
                    }}
                    className={`flex items-center justify-between gap-4 border-l-4 px-6 py-4 transition-colors cursor-pointer ${selectedCall === call.id
                        ? 'border-l-blue-500 bg-blue-900/20'
                        : 'border-l-transparent hover:bg-slate-800/50'
                      }`}
                  >
                    {/* Left Section - Avatar, Name, Type */}
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {call.avatar ? (
                          <img
                            src={call.avatar}
                            alt={call.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-600">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{call.name}</p>
                        <div className="mt-1 flex items-center gap-2">
                          {getCallIcon(call.type)}
                          <span className="text-xs text-slate-400">
                            {getCallTypeLabel(call.type)}
                          </span>
                          {call.phoneNumber && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs text-slate-500">{call.phoneNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Duration, Time, Delete */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-medium text-slate-300">
                          {formatDuration(call.duration)}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(call.date)}</p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteCall(call.id, e)}
                        className="rounded-lg bg-slate-800/50 p-2 transition-colors hover:bg-red-900/50"
                        title="Delete call"
                      >
                        <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const mockCalls: CallLogEntry[] = [
  {
    id: '1',
    name: 'John Doe',
    type: 'incoming',
    duration: 1245,
    date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
    status: 'completed',
    phoneNumber: '+1 (555) 123-4567',
  },
  {
    id: '2',
    name: 'Sarah Smith',
    type: 'outgoing',
    duration: 3620,
    date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
    status: 'completed',
    phoneNumber: '+1 (555) 987-6543',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    type: 'missed',
    duration: 0,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'missed',
    phoneNumber: '+1 (555) 555-5555',
  },
  {
    id: '4',
    name: 'Emma Wilson',
    type: 'incoming',
    duration: 567,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'completed',
    phoneNumber: '+1 (555) 111-2222',
  },
  {
    id: '5',
    name: 'David Brown',
    type: 'outgoing',
    duration: 890,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'completed',
    phoneNumber: '+1 (555) 222-3333',
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    type: 'incoming',
    duration: 2340,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'completed',
    phoneNumber: '+1 (555) 333-4444',
  },
  {
    id: '7',
    name: 'Tom Parker',
    type: 'missed',
    duration: 0,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'missed',
    phoneNumber: '+1 (555) 444-5555',
  },
  {
    id: '8',
    name: 'Anna Martinez',
    type: 'outgoing',
    duration: 1567,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'completed',
    phoneNumber: '+1 (555) 666-7777',
  },
];
