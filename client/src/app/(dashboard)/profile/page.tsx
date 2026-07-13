'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getAllUsers, addFriend } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, UserPlus, UserCheck } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [addedFriends, setAddedFriends] = useState<string[]>([]);

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: getCurrentUser,
    enabled: !!user,
  });

  const usersQuery = useQuery({
    queryKey: ['allUsers'],
    queryFn: getAllUsers,
    enabled: !!user,
  });

  const handleAddFriend = async (friendId: string) => {
    try {
      await addFriend(friendId);
      setAddedFriends((prev) => [...prev, friendId]);
    } catch (error) {
      console.error('Failed to add friend:', error);
    }
  };

  const router = useRouter();
  const profile = profileQuery.data;
  const allUsers = usersQuery.data || [];
  const friendIds = profile?.friends?.map((f) => f.id) || [];
  const suggestedUsers = allUsers.filter((u) => u.id !== user?.id && !friendIds.includes(u.id) && !addedFriends.includes(u.id));

  return (
    <div className="space-y-6 p-6">
      {/* User Profile Card */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{profile?.name || 'Loading...'}</CardTitle>
              <CardDescription className="mt-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {profile?.email}
              </CardDescription>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xl font-semibold">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Friends List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Friends ({friendIds.length})</h2>
        {friendIds.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {profile?.friends?.map((friend) => (
              <Card key={friend.id} className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                      {friend.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{friend.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{friend.email}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => router.push(`/chat?userId=${friend.id}`)}
                    className="flex-shrink-0"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No friends yet. Add some below!</p>
        )}
      </div>

      {/* Add Friends Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Add Friends</h2>
        {suggestedUsers.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {suggestedUsers.map((suggestedUser) => (
              <Card key={suggestedUser.id} className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white text-sm font-semibold flex-shrink-0">
                      {suggestedUser.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{suggestedUser.name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{suggestedUser.email}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleAddFriend(suggestedUser.id)}
                    className="flex-shrink-0"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No more users to add!</p>
        )}
      </div>
    </div>
  );
}

