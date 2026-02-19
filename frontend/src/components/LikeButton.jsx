import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike, checkLike } from '../store/slices/socialSlice';

const LikeButton = ({ recipeId, initialLikes = 0 }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { likes } = useSelector((state) => state.social);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && recipeId) {
      dispatch(checkLike(recipeId));
    }
  }, [dispatch, recipeId, user]);

  useEffect(() => {
    setIsLiked(likes[recipeId] || false);
  }, [likes, recipeId]);

  const handleLike = async () => {
    if (!user) {
      alert('Veuillez vous connecter pour liker');
      return;
    }

    setLoading(true);
    const result = await dispatch(toggleLike(recipeId));
    setLoading(false);
    
    if (!result.error) {
      // Mettre à jour le compteur localement
      setLikesCount(prev => result.payload.liked ? prev + 1 : prev - 1);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className="flex items-center space-x-2 focus:outline-none group disabled:opacity-50"
    >
      {isLiked ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 transition transform group-hover:scale-110" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 transition transform group-hover:scale-110 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
      <span className="text-lg font-medium text-gray-700">{likesCount}</span>
    </button>
  );
};

export default LikeButton;