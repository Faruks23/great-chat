import api from '@/lib/axios';

export interface Group {
  _id: string;
  name: string;
  members: string[];
  conversationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupInput {
  name: string;
  members: string[];
}

export async function getGroups(): Promise<Group[]> {
  const response = await api.get<Group[]>('/groups');
  return response.data;
}

export async function createGroup(data: CreateGroupInput): Promise<Group> {
  const response = await api.post<Group>('/groups', data);
  return response.data;
}
