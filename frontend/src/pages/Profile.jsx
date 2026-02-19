import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile, updateProfile, deleteAccount, clearSuccess, clearError } from '../store/slices/profileSlice';
import { logout } from '../store/slices/authSlice';

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
        alert('Image trop volumineuse (max 5MB)');
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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      dispatch(deleteAccount()).then(() => {
        dispatch(logout());
        navigate('/register');
      });
    }
  };

  if (!user) {
    return <div className="text-center py-12">Veuillez vous connecter</div>;
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f5f0e8'}}>
      {/* PLUS DE NAVBAR ICI - ELLE EST DANS App.js */}
      
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6" style={{color: '#8b5a2b'}}>Mon Profil</h1>

          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            {/* Photo de profil */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Photo de profil" 
                    className="w-32 h-32 rounded-full object-cover border-4"
                    style={{borderColor: '#ffb6c1'}}
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl">
                    👤
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <label className="px-4 py-2 rounded-md text-white cursor-pointer hover:opacity-80 transition"
                  style={{backgroundColor: '#c4a484'}}>
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
                    className="px-4 py-2 rounded-md text-white hover:opacity-80 transition"
                    style={{backgroundColor: '#ffb6c1'}}
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>

            {/* Informations de base */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{focusRingColor: '#ffb6c1'}}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{focusRingColor: '#ffb6c1'}}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{focusRingColor: '#ffb6c1'}}
                  placeholder="Parlez-nous de vous, de vos passions culinaires..."
                />
              </div>
            </div>

            {/* Changer mot de passe */}
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {showPasswordForm ? 'Masquer' : 'Changer le mot de passe'}
              </button>

              {showPasswordForm && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-red-500 text-sm">{passwordError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md">
                ✅ Profil mis à jour avec succès !
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 text-white py-2 px-4 rounded-md hover:opacity-80 transition disabled:opacity-50"
                style={{backgroundColor: '#c4a484'}}
              >
                {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 rounded-md text-white hover:opacity-80 transition"
                style={{backgroundColor: '#ffb6c1'}}
              >
                Supprimer le compte
              </button>
            </div>
          </form>

          {/* Statistiques */}
          <div className="mt-8 pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4" style={{color: '#8b5a2b'}}>Statistiques</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg" style={{backgroundColor: '#ffd8b0'}}>
                <p className="text-2xl font-bold" style={{color: '#8b5a2b'}}>0</p>
                <p className="text-sm text-gray-600">Recettes</p>
              </div>
              <div className="p-3 rounded-lg" style={{backgroundColor: '#fff9e6'}}>
                <p className="text-2xl font-bold" style={{color: '#8b5a2b'}}>0</p>
                <p className="text-sm text-gray-600">Favoris</p>
              </div>
              <div className="p-3 rounded-lg" style={{backgroundColor: '#d8f0d8'}}>
                <p className="text-2xl font-bold" style={{color: '#8b5a2b'}}>0</p>
                <p className="text-sm text-gray-600">Commentaires</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;