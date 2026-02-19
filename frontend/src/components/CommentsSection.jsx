import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComments, addComment, deleteComment } from '../store/slices/socialSlice';
import RatingStars from './RatingStars';

const CommentsSection = ({ recipeId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { comments, isLoading } = useSelector((state) => state.social);
  const recipeComments = comments[recipeId] || [];
  
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (recipeId) {
      dispatch(fetchComments(recipeId));
    }
  }, [dispatch, recipeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Veuillez vous connecter pour commenter');
      return;
    }

    if (newComment.trim() === '') {
      alert('Veuillez écrire un commentaire');
      return;
    }

    setSubmitting(true);
    await dispatch(addComment({
      recipeId,
      content: newComment,
      rating: rating || null
    }));
    setSubmitting(false);

    setNewComment('');
    setRating(0);
    setShowRating(false);
  };

  const handleDelete = (commentId) => {
    if (window.confirm('Supprimer ce commentaire ?')) {
      dispatch(deleteComment(commentId));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-6" style={{color: '#8b5a2b'}}>
        Commentaires ({recipeComments.length})
      </h2>

      {/* Formulaire d'ajout */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-lg" style={{backgroundColor: '#f5f0e8'}}>
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowRating(!showRating)}
              className="text-sm mb-2 px-3 py-1 rounded-full"
              style={{backgroundColor: '#ffb6c1', color: '#8b5a2b'}}
            >
              {showRating ? 'Masquer la note' : 'Ajouter une note'}
            </button>
            
            {showRating && (
              <div className="mb-4">
                <p className="text-sm mb-2" style={{color: '#8b5a2b'}}>Votre note :</p>
                <RatingStars
                  rating={rating}
                  onRate={setRating}
                  size="h-8 w-8"
                />
              </div>
            )}
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Partagez votre avis sur cette recette..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
            style={{backgroundColor: '#fff9e6'}}
            disabled={submitting}
          />

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-white rounded-md hover:opacity-80 disabled:opacity-50"
            style={{backgroundColor: '#c4a484'}}
          >
            {submitting ? 'Publication...' : 'Publier le commentaire'}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 text-center rounded-lg" style={{backgroundColor: '#f5f0e8'}}>
          <p className="text-gray-600">
            <a href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Connectez-vous</a> pour laisser un commentaire
          </p>
        </div>
      )}

      {/* Liste des commentaires */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: '#c4a484'}}></div>
        </div>
      ) : recipeComments.length === 0 ? (
        <p className="text-center py-8 text-gray-500 italic">
          Aucun commentaire pour le moment. Soyez le premier à commenter !
        </p>
      ) : (
        <div className="space-y-4">
          {recipeComments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-lg" style={{backgroundColor: '#fff9e6'}}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  {comment.profileImage ? (
                    <img
                      src={`http://localhost:5000${comment.profileImage}`}
                      alt={comment.username}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold" style={{color: '#8b5a2b'}}>{comment.username}</p>
                    <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
                
                {user && comment.userId === user.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>

              {comment.rating && (
                <div className="mb-2">
                  <RatingStars rating={comment.rating} readonly size="h-4 w-4" />
                </div>
              )}

              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;