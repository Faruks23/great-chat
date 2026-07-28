"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getCurrentUser, getAllUsers, addFriend } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, MessageCircle, Phone, VideoIcon, MoreVertical, UserPlus, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { User } from '@/types';

export default function ProfilePage() {
  const { user, isReady,refresh } = useAuth();
  const [addedFriends, setAddedFriends] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Profile query with error handling
  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      try {
        const data= await getCurrentUser();
        setError(null);
        return data ;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load profile';
        setError(message);
        throw err;
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  console.log(profileQuery)

  // Users query with error handling
  const usersQuery = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      try {
        const data = await getAllUsers();
        setError(null);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load contacts';
        setError(message);
        throw err;
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Add friend mutation with error handling
  const addFriendMutation = useMutation({
    mutationFn: addFriend,
    onSuccess: (_, friendId) => {
      setAddedFriends((prev) => [...prev, friendId]);
      setError(null);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Failed to add friend';
      setError(message);
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    
    if (user === null) {
      refresh();
      // router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  
  const isLoadingProfile = profileQuery.isLoading;
  const isLoadingUsers = usersQuery.isLoading;
  const hasProfileError = profileQuery.isError;
  const hasUsersError = usersQuery.isError;
  
  const profile = profileQuery.data;
  const allUsers = Array.isArray(usersQuery.data) ? usersQuery.data : [];
  const friendIds = profile?.friends?.map((f) => f.id) || [];
  const suggestedUsers = allUsers.filter(
    (u) => u.id !== user?.id && !friendIds.includes(u.id) && !addedFriends.includes(u.id)
  );

  return (
    <div className="bg-linear-to-b from-green-50 to-white dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Error Alert */}
      {error && (
        <div className="sticky top-0 z-50 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-300 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Profile Header Section */}
        <div className="relative bg-linear-to-b from-emerald-500 to-emerald-600 pt-8 pb-20">
          {/* Profile Card */}
          <div className="px-4">
            <div className="flex flex-col items-center text-center text-white">
              {isLoadingProfile ? (
                <div className="h-32 w-32 rounded-full bg-white/20 animate-pulse" />
              ) : (
                <div className="h-32 w-32 rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-5xl font-bold shadow-lg ring-4 ring-white dark:ring-slate-800">
                  {profile?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <h1 className="mt-6 text-3xl font-bold">{profile?.name || 'Loading...'}</h1>
              <p className="mt-2 text-emerald-100 text-sm">
                {profile?.email || 'Loading contact info...'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center mt-8">
              <Button
                onClick={() => router.push(`/chat?userId=${user?.id}`)}
                className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-full px-6 font-semibold gap-2 flex items-center"
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 rounded-full px-6 font-semibold gap-2 flex items-center"
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10 rounded-full px-6 font-semibold gap-2 flex items-center"
              >
                <VideoIcon className="h-4 w-4" />
                Video
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 -mt-12 pb-8 space-y-6 relative z-10">
          {/* About Section */}
          {profile && (
            <Card className="p-6 rounded-2xl shadow-md">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Mail className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Email</p>
                    <p className="text-sm font-medium">{profile.email}</p>
                  </div>
                </div>
                {profile.friends && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Friends</p>
                      <p className="text-sm font-medium">{profile.friends.length} friends</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Friends Section */}
          <div>
            <h2 className="px-2 text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              Friends
              {!isLoadingProfile && friendIds.length > 0 && (
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({friendIds.length})</span>
              )}
            </h2>

            {hasProfileError ? (
              <Card className="p-6 text-center border-red-200 dark:border-red-900">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Failed to load friends</p>
                <Button
                  onClick={() => profileQuery.refetch()}
                  size="sm"
                  className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                >
                  Retry
                </Button>
              </Card>
            ) : isLoadingProfile ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : friendIds.length > 0 ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {profile?.friends?.map((friend) => (
                  <Card
                    key={friend.id}
                    className="p-4 rounded-2xl hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/chat?userId=${friend.id}`)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm flex-shrink-0">
                          {friend.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {friend.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{friend.email}</p>
                        </div>
                      </div>
                      <div className="text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center rounded-2xl border-dashed bg-slate-50 dark:bg-slate-900/50">
                <UserCheck className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No friends yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Add people below to start chatting</p>
              </Card>
            )}
          </div>

          {/* Add Friends Section */}
          <div>
            <h2 className="px-2 text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Add Contacts
            </h2>

            {hasUsersError ? (
              <Card className="p-6 text-center border-red-200 dark:border-red-900">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Failed to load contacts</p>
                <Button
                  onClick={() => usersQuery.refetch()}
                  size="sm"
                  className="mt-3 bg-emerald-600 hover:bg-emerald-700"
                >
                  Retry
                </Button>
              </Card>
            ) : isLoadingUsers ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : suggestedUsers && suggestedUsers.length > 0 ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {suggestedUsers.map((suggestedUser) => (
                  <Card key={suggestedUser.id} className="p-4 rounded-2xl hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-500 text-white font-bold text-sm flex-shrink-0">
                          {suggestedUser.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {suggestedUser.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {suggestedUser.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex-shrink-0"
                        onClick={() => handleAddFriend(suggestedUser.id)}
                        disabled={addFriendMutation.isPending}
                      >
                        {addFriendMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center rounded-2xl border-dashed bg-slate-50 dark:bg-slate-900/50">
                <UserPlus className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">All caught up!</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  You&apos;re friends with everyone available
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function handleAddFriend(friendId: string) {
    addFriendMutation.mutate(friendId);
  }
}
