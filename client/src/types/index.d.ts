export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  friends?: User[];
};

export type Message = {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
};
