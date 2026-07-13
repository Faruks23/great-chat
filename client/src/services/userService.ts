import api from '@/lib/axios';
import type { User } from '@/types';

export interface UserProfile extends User {
  avatar?: string;
  phone?: string;
  friends?: User[];
  conversationId?: string;
}

/**
 * Get the currently authenticated user's profile details.
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const response = await api.get<UserProfile>('/users/current');
  return response.data;
}

/**
 * Retrieve the list of all user profiles, used for starting new chats.
 */
export async function getAllUsers(): Promise<User[]> {
  const response = await api.get<User[]>('/users');
  return response.data;
}

/**
 * Search for a user by email or phone.
 */
export async function searchUser(query: string): Promise<User> {
  const response = await api.get<User>('/users/search', {
    params: { q: query },
  });
  return response.data;
}

/**
 * Fetch the profile data for the specified user ID.
 */
export async function getUserById(id: string): Promise<User> {
  const response = await api.get<User>(`/users/${id}`);
  return response.data;
}

/**
 * Add another user as a friend and return the updated profile.
 */
export async function addFriend(friendId: string): Promise<UserProfile> {
  const response = await api.post<UserProfile>(`/users/${friendId}/friends`);
  return response.data;
}
