'use client';

const AVATAR_COLORS = [
  'bg-rose-500',
  'bg-sky-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-pink-500',
];

/**
 * Choose a deterministic background color based on the name string.
 * This keeps avatar colors consistent between renders.
 */
function colorForName(name: string) {
  const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

/**
 * Create initials from the first two words in the provided name.
 */
function initialsFor(name: string) {
  return name
    .split(' ')
    .map((piece) => piece[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * ChatAvatar renders a circular user avatar with initials and an online badge.
 */
export default function ChatAvatar({
  name,
  online,
  size = 40,
}: {
  name: string;
  online?: boolean;
  size?: number;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={`flex h-full w-full items-center justify-center rounded-full font-semibold text-white ${colorForName(
          name
        )}`}
        style={{ fontSize: size * 0.36 }}
      >
        {initialsFor(name)}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900">
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
        </span>
      )}
    </div>
  );
}
