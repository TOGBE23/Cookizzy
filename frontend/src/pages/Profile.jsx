import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { fetchUserProfile, updateProfile, deleteAccount, clearSuccess, clearError } from '../store/slices/profileSlice';
import { logout } from '../store/slices/authSlice';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { profile, isLoading, error, success } = useSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserProfile(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        username: profile.username || '',
        email: profile.email || '',
        bio: profile.bio || ''
      }));
      
      if (profile.profileImage) {
        setImagePreview(`http://localhost:5000${profile.profileImage}`);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (success) {
      toast.success('Profil mis à jour avec succès !', {
        position: 'bottom-center',
        id: 'profile-success'
      });
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) dispatch(clearError());
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image trop volumineuse (max 5MB)', {
          id: 'image-error'
        });
        return;
      }
      setImage(file);
      setRemoveImage(false);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    setRemoveImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword || formData.currentPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setPasswordError('Les mots de passe ne correspondent pas');
        return;
      }
      if (formData.newPassword.length < 6) {
        setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
    }

    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.username);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('bio', formData.bio || '');
    
    if (formData.currentPassword) {
      formDataToSend.append('currentPassword', formData.currentPassword);
    }
    if (formData.newPassword) {
      formDataToSend.append('newPassword', formData.newPassword);
    }
    
    if (image) {
      formDataToSend.append('profileImage', image);
    } else if (removeImage) {
      formDataToSend.append('removeImage', 'true');
    }

    await dispatch(updateProfile(formDataToSend));
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    dispatch(deleteAccount()).then(() => {
      dispatch(logout());
      toast.success('Compte supprimé', {
        position: 'bottom-center'
      });
      navigate('/register');
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-neutral-600 dark:text-gray-300">Veuillez vous connecter</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-neutral-700 dark:text-white">Mon Profil</h1>

          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            {/* Photo de profil */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Photo de profil" 
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4"
                    style={{borderColor: '#ffb6c1'}}
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-4xl text-gray-500 dark:text-gray-400">
                    👤
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                <label className="px-4 py-2 bg-primary-main dark:bg-primary-dark text-white rounded-lg hover:opacity-90 transition cursor-pointer">
                  Changer photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                
                {(imagePreview || profile?.profileImage) && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-90 transition"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>

            {/* Informations de base */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-gray-300">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 transition-all"
                  placeholder="Parlez-nous de vous, de vos passions culinaires..."
                />
              </div>
            </div>

            {/* Changer mot de passe */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <button
                type="button"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-primary-dark dark:text-primary-light hover:underline font-medium"
              >
                {showPasswordForm ? 'Masquer' : 'Changer le mot de passe'}
              </button>

              {showPasswordForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-gray-300">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-gray-300">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-gray-300">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-neutral-700 dark:text-white"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-red-600 dark:text-red-400 text-sm">{passwordError}</p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-500 dark:bg-primary-dark text-white py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:opacity-90 transition"
              >
                Supprimer le compte
              </button>
            </div>
          </form>

          {/* Statistiques */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-neutral-700 dark:text-white">Statistiques</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-secondary-100 dark:bg-gray-700">
                <p className="text-2xl font-bold text-neutral-700 dark:text-white">0</p>
                <p className="text-xs text-neutral-600 dark:text-gray-300">Recettes</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary-100 dark:bg-gray-700">
                <p className="text-2xl font-bold text-neutral-700 dark:text-white">0</p>
                <p className="text-xs text-neutral-600 dark:text-gray-300">Favoris</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary-100 dark:bg-gray-700">
                <p className="text-2xl font-bold text-neutral-700 dark:text-white">0</p>
                <p className="text-xs text-neutral-600 dark:text-gray-300">Commentaires</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal de confirmation suppression compte */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteAccount}
        title="⚠️ Supprimer le compte"
        message={
          <div className="text-neutral-700 dark:text-gray-200">
            <p className="mb-2">Êtes-vous sûr de vouloir supprimer votre compte ?</p>
            <p className="text-sm text-red-600 dark:text-red-400">Cette action est irréversible ! Toutes vos données seront perdues.</p>
          </div>
        }
        confirmText="Oui, supprimer"
        cancelText="Annuler"
      />
    </div>
  );
};

export default Profile;