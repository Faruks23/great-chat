'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import ChatAvatar from '../ui/ChatAvatar';

type ContactsSectionProps = {
  contacts: any[];
  onSelect: (contact: any) => void;
};

export default function ContactsSection({
  contacts,
  onSelect,
}: ContactsSectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className="border-t border-zinc-200 dark:border-zinc-800">

      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <div className="flex items-center gap-2">

          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}

          <span className="font-medium">
            Contacts
          </span>

          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
            {contacts.length}
          </span>

        </div>
      </button>

      {expanded && (
        <div className="space-y-1 px-2 pb-3">

          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => onSelect(contact)}
              className="flex w-full items-center gap-3 rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <ChatAvatar
                name={contact.name}
                src={contact.avatar}
                online={contact.online}
                size={42}
              />

              <div className="min-w-0 flex-1">

                <p className="truncate font-medium">
                  {contact.name}
                </p>

                <p
                  className={cn(
                    "text-xs",
                    contact.online
                      ? "text-emerald-500"
                      : "text-zinc-500"
                  )}
                >
                  {contact.online ? "Online" : "Offline"}
                </p>

              </div>
            </button>
          ))}

        </div>
      )}
    </section>
  );
}