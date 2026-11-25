interface Props {
  className?: string;
  /** Duckling: smaller, rounder, no wing detail. */
  baby?: boolean;
  title?: string;
}

/** Simple flat duck illustration (decorative unless a title is given). */
export default function DuckIcon({ className = 'h-10 w-10', baby = false, title }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <ellipse cx="30" cy={baby ? 44 : 42} rx={baby ? 18 : 22} ry={baby ? 13 : 14} fill="#E9C46A" />
      {!baby && <path d="M18 40c6-6 16-6 20 2-6 4-14 4-20-2z" fill="#D9AE4A" />}
      <circle cx={baby ? 40 : 42} cy={baby ? 26 : 22} r={baby ? 10 : 12} fill="#E9C46A" />
      <path d={baby ? 'M48 26l8 2.5-8 2.5z' : 'M52 22l10 3-10 3z'} fill="#D98A2B" />
      <circle cx={baby ? 43 : 45} cy={baby ? 24 : 19} r="2" fill="#1B2A41" />
    </svg>
  );
}

export function DuckFamily({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-end gap-1 ${className}`} aria-hidden>
      <DuckIcon className="h-14 w-14" />
      {Array.from({ length: 6 }, (_, i) => (
        <DuckIcon key={i} baby className="h-8 w-8" />
      ))}
    </div>
  );
}
