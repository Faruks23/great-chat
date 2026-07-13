'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { getAllUsers } from '@/services/userService';
import { createConversation } from '@/services/chatService';
import type { Conversation } from '@/store/chatSlice';
import { X } from 'lucide-react';

type AddUserChatModalProps = {
  open: boolean;
  currentUserId: string | null;
  onClose: () => void;
  onChatCreated: (conversation: Conversation) => void;
};

/**
 * AddUserChatModal displays a modal for starting a new private chat.
 * It validates the entered email against the user list and creates a conversation.
 */
export default function AddUserChatModal({ open, currentUserId, onClose, onChatCreated }: AddUserChatModalProps) {
  const [friendEmail, setFriendEmail] = useState('');
  const [error, setError] = useState('');

  // Load all users only when the modal is open and the current user is known.
  const usersQuery = useQuery({
    queryKey: ['allUsers'],
    queryFn: getAllUsers,
    enabled: open && Boolean(currentUserId),
  });

  // Mutation to create a new conversation once a valid participant is selected.
  const createChatMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const participant = usersQuery.data?.find((u) => u.id === participantId);
      const title = participant ? participant.name : 'New Chat';
      return createConversation({ name: title, participants: [currentUserId ?? '', participantId] });
    },
    onSuccess: (conversation) => {
      setFriendEmail('');
      setError('');
      onClose();
      onChatCreated(conversation);
    },
  });

  const handleStartChat = () => {
    setError('');
    const normalizedEmail = friendEmail.trim().toLowerCase();
    const participant = usersQuery.data?.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!participant) {
      setError('No user found with that email.');
      return;
    }

    if (participant.id === currentUserId) {
      setError('You cannot start a chat with yourself.');
      return;
    }

    createChatMutation.mutate(participant.id);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Add friend by email</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Enter your friend’s email to start a private chat.</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            onClick={() => {
              setFriendEmail('');
              setError('');
              onClose();
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label htmlFor="friend-email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Friend email
            </label>
            <input
              id="friend-email"
              type="email"
              value={friendEmail}
              onChange={(event) => setFriendEmail(event.target.value)}
              placeholder="name@example.com"
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/20"
            />
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Enter the email of the friend you want to start a chat with.
            </p>
          </div>

          {usersQuery.isLoading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading user list…</p>
          ) : usersQuery.error ? (
            <p className="text-sm text-red-500">Unable to validate emails right now.</p>
          ) : null}

          {error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => { setFriendEmail(''); setError(''); onClose(); }}>
            Cancel
          </Button>
          <Button
            onClick={handleStartChat}
            disabled={!friendEmail.trim() || createChatMutation.isPending}
          >
            {createChatMutation.isPending ? 'Starting…' : 'Start chat'}
          </Button>
        </div>
      </div>
    </div>
  );
}
