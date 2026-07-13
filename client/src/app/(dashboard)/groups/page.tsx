'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getGroups, createGroup, type CreateGroupInput } from '@/services/groupService';
import { getAllUsers } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, X } from 'lucide-react';

export default function GroupsPage() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const groupsQuery = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const usersQuery = useQuery({
    queryKey: ['allUsers'],
    queryFn: getAllUsers,
    enabled: !!user,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupInput) => {
      return createGroup(data);
    },
    onSuccess: () => {
      setGroupName('');
      setSelectedMembers([]);
      setShowCreateModal(false);
      groupsQuery.refetch();
    },
  });

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert('Please enter a group name and select at least one member.');
      return;
    }

    createGroupMutation.mutate({
      name: groupName,
      members: selectedMembers,
    });
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const groups = groupsQuery.data || [];
  const allUsers = usersQuery.data || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Groups</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Create and manage team channels</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Groups Grid */}
      {groups.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group._id} className="overflow-hidden hover:shadow-md transition">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate">{group.name}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-2">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      {group.members.length} members
                    </CardDescription>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-semibold flex-shrink-0">
                    {group.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <Users className="mx-auto h-12 w-12 text-zinc-400 mb-4" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">No groups yet. Create one to get started!</p>
          <Button onClick={() => setShowCreateModal(true)} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Create New Group</CardTitle>
                <CardDescription>Create a new group with your friends</CardDescription>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setGroupName('');
                  setSelectedMembers([]);
                }}
                className="rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <div className="space-y-5 px-6 pb-6">
              {/* Group Name Input */}
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name"
                  className="w-full"
                />
              </div>

              {/* Members Selection */}
              <div className="space-y-2">
                <Label>Select Members</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-zinc-200 rounded-lg p-3 dark:border-zinc-700">
                  {allUsers.filter((u) => u.id !== user?.id).length > 0 ? (
                    allUsers
                      .filter((u) => u.id !== user?.id)
                      .map((u) => (
                        <label key={u.id} className="flex items-center gap-3 p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(u.id)}
                            onChange={() => toggleMember(u.id)}
                            className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{u.name}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{u.email}</p>
                          </div>
                        </label>
                      ))
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No users available</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateModal(false);
                    setGroupName('');
                    setSelectedMembers([]);
                  }}
                  disabled={createGroupMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreateGroup}
                  disabled={createGroupMutation.isPending || !groupName.trim() || selectedMembers.length === 0}
                >
                  {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

