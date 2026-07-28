import { UserData } from "../user/user.interface";


type ConversationData = {
  _id: any;
  name: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: Date;
};

export const mapConversation = (
  conversation: ConversationData,
  otherUser?: Partial<UserData> | null
) => {
  return {
    id: conversation._id.toString(),

    name: otherUser?.name || conversation.name,

    participants: conversation.participants,

    lastMessage: conversation.lastMessage ?? "",

    time: new Date(conversation.updatedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),

    unread: 0,

    online: false,

    lastSeen: otherUser?.lastSeen
      ? new Date(otherUser.lastSeen).toISOString()
      : undefined,
  };
};