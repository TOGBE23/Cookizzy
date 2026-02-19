import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRecipeById, updateRecipe } from '../store/slices/recipeSlice';
import ConfirmModal from '../components/ConfirmModal';

const EditRecipe = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentRecipe, isLoading, error } = useSelector((state) => state.recipes);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    steps: [''],
    prepTime: '',
    difficulty: 'Facile',
    category: '',
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const loadRecipe = async () => {
      setLoading(true);
      await dispatch(fetchRecipeById(id));
      setLoading(false);
    };
    loadRecipe();
  }, [dispatch, id]);

  useEffect(() => {
    if (currentRecipe && !isLoading) {
      setFormData({
        title: currentRecipe.title || '',
        description: currentRecipe.description || '',
        ingredients: currentRecipe.ingredients || [{ name: '', quantity: '', unit: '' }],
        steps: currentRecipe.steps || [''],
        prepTime: currentRecipe.prepTime || '',
        difficulty: currentRecipe.difficulty || 'Facile',
        category: currentRecipe.category || '',
        tags: currentRecipe.tags || []
      });
      
      if (currentRecipe.imageUrl) {
        setCurrentImageUrl(currentRecipe.imageUrl);
        setImagePreview(`http://localhost:5000${currentRecipe.imageUrl}`);
      }
    }
  }, [currentRecipe, isLoading]);

  useEffect(() => {
    if (currentRecipe && user && currentRecipe.authorId !== user.id) {
      alert("Vous n'êtes pas autorisé à modifier cette recette");
      navigate('/my-recipes');
    }
  }, [currentRecipe, user, navigate]);

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '' }]
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData({ ...formData, steps: newSteps });
  };

  const addStep = () => {
    setFormData({ ...formData, steps: [...formData.steps, ''] });
  };

  const removeStep = (index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    setFormData({ ...formData, steps: newSteps });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert('Image trop volumineuse (max 20MB)');
        return;
      }
      setImage(file);
      setRemoveCurrentImage(false);
      
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
    setRemoveCurrentImage(true);
  };

  const handleKeepImage = () => {
    setImage(null);
    setRemoveCurrentImage(false);
    if (currentImageUrl) {
      setImagePreview(`http://localhost:5000${currentImageUrl}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validIngredients = formData.ingredients.filter(ing => ing.name.trim() !== '');
    
    if (validIngredients.length === 0) {
      alert('Ajoutez au moins un ingrédient');
      return;
    }

    const validSteps = formData.steps.filter(step => step.trim() !== '');
    
    if (validSteps.length === 0) {
      alert('Ajoutez au moins une étape');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('ingredients', JSON.stringify(validIngredients));
    formDataToSend.append('steps', JSON.stringify(validSteps));
    formDataToSend.append('prepTime', formData.prepTime || '');
    formDataToSend.append('difficulty', formData.difficulty);
    formDataToSend.append('category', formData.category || '');
    formDataToSend.append('tags', JSON.stringify(formData.tags));
    
    if (image) {
      formDataToSend.append('image', image);
    } else if (removeCurrentImage) {
      formDataToSend.append('removeImage', 'true');
    }

    const result = await dispatch(updateRecipe({ id, recipeData: formDataToSend }));
    if (!result.error) {
      navigate(`/recipe/${id}`);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{borderColor: '#c4a484'}}></div>
          <p className="mt-4 text-gray-600">Chargement de la recette...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f5f0e8'}}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Bouton retour (simple) */}
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="mb-4 px-4 py-2 rounded-md text-white hover:opacity-80 transition flex items-center gap-2"
          style={{backgroundColor: '#a0522d'}}
        >
          ← Retour
        </button>

        <h1 className="text-3xl font-bold mb-8" style={{color: '#8b5a2b'}}>Modifier la recette</h1>

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* ... (tout le formulaire reste identique) ... */}
          {/* Reprenez tout le formulaire de votre EditRecipe existant */}
        </form>
      </div>

      {/* Modal de confirmation pour l'annulation */}
      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => navigate(-1)}
        title="Annuler les modifications"
        message="Voulez-vous vraiment annuler ? Toutes vos modifications seront perdues."
        confirmText="Oui, annuler"
        cancelText="Non, continuer"
      />
    </div>
  );
};

export default EditRecipe;