import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchComments, addComment, deleteComment } from '../store/slices/socialSlice';
import RatingStars from './RatingStars';
import ConfirmModal from './ConfirmModal';

const CommentsSection = ({ recipeId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { comments, isLoading } = useSelector((state) => state.social);
  const recipeComments = comments[recipeId] || [];
  
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // États pour la confirmation de suppression
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    if (recipeId) {
      dispatch(fetchComments(recipeId));
    }
  }, [dispatch, recipeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Veuillez vous connecter pour commenter', {
        position: 'bottom-center',
        id: 'login-to-comment'
      });
      return;
    }

    if (newComment.trim() === '') {
      toast.error('Veuillez écrire un commentaire', {
        position: 'bottom-center',
        id: 'empty-comment'
      });
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
    
    toast.success('Commentaire ajouté !', {
      position: 'bottom-center',
      duration: 2000,
      id: 'comment-added'
    });
  };

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (commentToDelete) {
      dispatch(deleteComment(commentToDelete.id));
      toast.success('Commentaire supprimé', {
        position: 'bottom-center',
        duration: 2000,
        id: 'comment-deleted'
      });
      setCommentToDelete(null);
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
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-6 text-neutral-700 dark:text-white">
        Commentaires ({recipeComments.length})
      </h2>

      {/* Formulaire d'ajout */}
      {user ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="mb-8 p-4 rounded-xl bg-secondary-100 dark:bg-gray-700"
        >
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowRating(!showRating)}
              className="text-sm mb-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-neutral-700 dark:text-white hover:opacity-90 transition"
            >
              {showRating ? 'Masquer la note' : 'Ajouter une note'}
            </button>
            
            <AnimatePresence>
              {showRating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <p className="text-sm mb-2 text-neutral-700 dark:text-gray-300">Votre note :</p>
                  <RatingStars
                    rating={rating}
                    onRate={setRating}
                    size="h-6 w-6 sm:h-8 sm:w-8"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Partagez votre avis sur cette recette..."
            rows="3"
            className="w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg text-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 transition-all mb-3"
            disabled={submitting}
          />

          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-red-500 dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'Publication...' : 'Publier le commentaire'}
          </button>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-4 text-center rounded-xl bg-secondary-100 dark:bg-gray-700"
        >
          <p className="text-gray-600 dark:text-gray-300">
            <a href="/login" className="text-primary-dark dark:text-primary-light hover:underline font-medium">
              Connectez-vous
            </a> pour laisser un commentaire
          </p>
        </motion.div>
      )}

      {/* Liste des commentaires */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-100 dark:border-primary-800 border-t-transparent mx-auto"></div>
        </div>
      ) : recipeComments.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500 dark:text-gray-400 italic"
        >
          Aucun commentaire pour le moment. Soyez le premier à commenter !
        </motion.p>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {recipeComments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="p-4 rounded-xl bg-white dark:bg-gray-700 shadow-soft"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {comment.profileImage ? (
                      <img
                        src={`http://localhost:5000${comment.profileImage}`}
                        alt={comment.username}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-600 mr-3 flex items-center justify-center">
                        <span className="text-sm sm:text-base">👤</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm sm:text-base text-neutral-700 dark:text-white">
                        {comment.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {user && comment.userId === user.id && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteClick(comment)}
                      className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  )}
                </div>

                {/* Note du commentaire */}
                {comment.rating && (
                  <div className="mb-2">
                    <RatingStars rating={comment.rating} readonly size="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                )}

                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de confirmation pour la suppression */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCommentToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="🗑️ Supprimer le commentaire"
        message={
          <div className="text-neutral-700 dark:text-gray-200">
            <p className="mb-2">Êtes-vous sûr de vouloir supprimer ce commentaire ?</p>
            <p className="text-sm text-red-600 dark:text-red-400">Cette action est irréversible !</p>
          </div>
        }
        confirmText="Oui, supprimer"
        cancelText="Annuler"
      />
    </div>
  );
};

export default CommentsSection;