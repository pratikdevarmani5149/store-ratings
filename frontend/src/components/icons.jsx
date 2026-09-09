// A small, consistent set of stroke-based SVG icons used across the app.
// Kept as simple functional components so each usage can set size/color via props.

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const DashboardIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const StoreIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <path d="M4 9l1-5h14l1 5" />
    <path d="M4 9a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" />
    <path d="M5 9v10h14V9" />
    <path d="M10 19v-5h4v5" />
  </svg>
);

export const UsersIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M16 8.3a3 3 0 1 1 0 6" />
    <path d="M15.5 14.7c2.7.4 4.5 2.4 4.5 5.3" />
  </svg>
);

export const StarIcon = ({ filled, ...p }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...(filled ? { fill: 'currentColor', stroke: 'none' } : base)} {...p}>
    <path d="M12 3.5l2.6 5.6 6.1.6-4.6 4.1 1.4 6-5.5-3-5.5 3 1.4-6-4.6-4.1 6.1-.6z" strokeLinejoin="round" />
  </svg>
);

export const LogoutIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    <path d="M15 16l4-4-4-4" />
    <path d="M19 12H9" />
  </svg>
);

export const SearchIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const SortIcon = ({ direction, ...p }) => {
  if (direction === 'asc') {
    return (
      <svg viewBox="0 0 24 24" width="13" height="13" {...base} {...p}>
        <path d="M12 19V5" />
        <path d="M6 11l6-6 6 6" />
      </svg>
    );
  }
  if (direction === 'desc') {
    return (
      <svg viewBox="0 0 24 24" width="13" height="13" {...base} {...p}>
        <path d="M12 5v14" />
        <path d="M6 13l6 6 6-6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" {...base} opacity="0.4" {...p}>
      <path d="M8 9l4-4 4 4" />
      <path d="M16 15l-4 4-4-4" />
    </svg>
  );
};

export const PlusIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

export const CloseIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </svg>
);

export const KeyIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l8-8" />
    <path d="M16 7l2 2" />
    <path d="M19 4l2 2" />
  </svg>
);

export const EmptyIcon = (p) => (
  <svg viewBox="0 0 24 24" width="32" height="32" {...base} {...p}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M3 11h18" />
    <path d="M8 3.5v5" />
    <path d="M16 3.5v5" />
  </svg>
);

export const SettingsIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 17.35a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.65 13a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 6.6a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 2.24a1.7 1.7 0 0 0 1.04-1.56V0" />
  </svg>
);

export const TrashIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}>
    <path d="M4 7h16" />
    <path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />
    <path d="M18 7l-.8 12.1a2 2 0 0 1-2 1.9H8.8a2 2 0 0 1-2-1.9L6 7" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

export const ImageIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="M21 15l-5-5-9 9" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);
