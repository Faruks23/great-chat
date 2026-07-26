'use client';

import ConversationItem from './ConversationItem';

type ConversationListProps = {
  conversations: any[];
  activeConversationId?: string | number | null;
  onSelect: (conversation: any) => void;
};

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationListProps) {
  if (!conversations.length) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="text-center">
          <div className="mb-4 text-5xl">💬</div>

          <h3 className="text-lg font-semibold">
            No conversations
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Start chatting with your friends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">

      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          active={conversation.id === activeConversationId}
          onClick={() => onSelect(conversation)}
        />
      ))}

    </div>
  );
}