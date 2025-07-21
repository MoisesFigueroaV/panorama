import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
}

export function StarRating({ value, onChange, readOnly = false, size = 24 }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-0 m-0 bg-transparent border-none cursor-pointer"
          style={{ lineHeight: 0 }}
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(null)}
          onClick={() => !readOnly && onChange?.(star)}
          aria-label={`Calificar con ${star} estrella${star > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={
              (hovered !== null
                ? star <= hovered
                : star <= value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }
            fill={
              (hovered !== null
                ? star <= hovered
                : star <= value)
                ? 'currentColor'
                : 'none'
            }
          />
        </button>
      ))}
    </div>
  );
} 