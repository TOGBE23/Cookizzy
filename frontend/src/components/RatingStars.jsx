import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/solid';

const RatingStars = ({ rating = 0, total = 0, onRate, readonly = false, size = 'h-5 w-5' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    if (!readonly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const handleClick = (index) => {
    if (!readonly && onRate) {
      onRate(index);
    }
  };

  const getStarColor = (index) => {
    if (!readonly && hoverRating >= index) {
      return 'text-yellow-500';
    }
    if (index <= rating) {
      return 'text-yellow-400';
    }
    return 'text-gray-300';
  };

  return (
    <div className="flex items-center">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`${size} ${getStarColor(star)} transition-colors ${
              !readonly ? 'cursor-pointer hover:scale-110' : ''
            }`}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(star)}
          />
        ))}
      </div>
      {total > 0 && (
        <span className="ml-2 text-sm text-gray-500">
          ({total} avis)
        </span>
      )}
    </div>
  );
};

export default RatingStars;