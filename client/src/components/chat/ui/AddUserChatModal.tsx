'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { addFriend, searchUser } from '@/services/userService';
import type { User } from '@/types';
import type { Conversation } from '@/store/chatSlice';
import { X } from 'lucide-react';

type AddUserChatModalProps = {
  open: boolean;
  currentUserId: string | null;
  onClose: () => void;
  onFriendAdded: (friend: User, conversationId?: string) => void;
};

/**
 * AddUserChatModal displays a modal for adding a friend by email or phone.
 * It searches for a matching account and creates a friend connection before starting a chat.
 */
export default function AddUserChatModal({ open, currentUserId, onClose, onFriendAdded }: AddUserChatModalProps) {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searchError, setSearchError] = useState('');

  const addFriendMutation = useMutation({
    mutationFn: async (friendId: string) => addFriend(friendId),
    onSuccess: (data) => {
      if (searchResult) {
        onFriendAdded(searchResult, data.conversationId);
      }
      setQuery('');
      setSearchResult(null);
      setSearchError('');
      onClose();
    },
    onError: () => {
      setSearchError('Unable to add friend. Please try again.');
    },
  });

  const handleSearch = async () => {
    setSearchError('');
    setSearchResult(null);

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchError('Please enter an email or phone number.');
      return;
    }

    try {
      const user = await searchUser(trimmedQuery);
      if (user.id === currentUserId) {
        setSearchError('You cannot add yourself as a friend.');
        return;
      }
      setSearchResult(user);
    } catch (error) {
      setSearchError('No user found with that email or phone number.');
    }
  };

  const handleAddFriend = async () => {
    if (!searchResult) return;
    setSearchError('');
    await addFriendMutation.mutateAsync(searchResult.id);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Add friend by email or phone</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Search for a friend account and invite them into your contacts.</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            onClick={() => {
              setQuery('');
              setSearchResult(null);
              setSearchError('');
              onClose();
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="friend-query" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Email or phone
            </label>
            <input
              id="friend-query"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="name@example.com or +1234567890"
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/20"
            />
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Use the email address or phone number associated with your friend’s account.
            </p>
          </div>

          {searchError ? <p className="text-sm text-rose-600 dark:text-rose-400">{searchError}</p> : null}

          {searchResult ? (
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{searchResult.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{searchResult.email || searchResult.phone}</p>
                </div>
                <span className="rounded-full bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-white">Friendable</span>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button className=' p-3 rounded-md shadow-md' variant="outline" onClick={handleSearch} disabled={!query.trim() || addFriendMutation.isPending}>
              Search
            </Button>
            <Button
              variant='outline'
              className='p-3 rounded-md shadow-md'
              onClick={handleAddFriend}
              disabled={!searchResult || addFriendMutation.isPending}
            >
              {addFriendMutation.isPending ? 'Adding…' : 'Add friend'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
