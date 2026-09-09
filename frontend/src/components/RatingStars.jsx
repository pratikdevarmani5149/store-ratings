import { useState } from 'react';
import { StarIcon } from './icons';

// Read-only star display, e.g. showing a store's average rating.
export function RatingDisplay({ value, size = 15 }) {
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className="stars" style={{ color: 'var(--color-gold)' }} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} width={size} height={size} filled={n <= rounded} style={{ opacity: n <= rounded ? 1 : 0.3 }} />
      ))}
    </span>
  );
}

// Interactive input for submitting or editing a 1-5 rating.
export function RatingInput({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  const active = hover || value || 0;

  return (
    <span className="stars interactive" style={{ color: 'var(--color-gold)' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          width={20}
          height={20}
          filled={n <= active}
          style={{ opacity: n <= active ? 1 : 0.35 }}
          onMouseEnter={() => !disabled && setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => !disabled && onChange(n)}
        />
      ))}
    </span>
  );
}
