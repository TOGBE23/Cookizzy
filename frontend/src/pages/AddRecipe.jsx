import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addRecipe } from '../store/slices/recipeSlice';

const AddRecipe = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.recipes);
  
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

  // Gestion des ingrédients
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

  // Gestion des étapes
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

  // Gestion des tags
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

  // Gestion de l'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filtrer les ingrédients valides
    const validIngredients = formData.ingredients.filter(ing => ing.name.trim() !== '');
    
    if (validIngredients.length === 0) {
      alert('Ajoutez au moins un ingrédient');
      return;
    }

    // Filtrer les étapes valides
    const validSteps = formData.steps.filter(step => step.trim() !== '');
    
    if (validSteps.length === 0) {
      alert('Ajoutez au moins une étape');
      return;
    }
    // Dans handleSubmit, après la validation des ingrédients
if (image && image.size > 10 * 1024 * 1024) {
  alert('L\'image est trop grande (max 10 Mo)');
  return;
}

    // Créer FormData pour l'envoi d'image
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
    }

    try {
      const result = await dispatch(addRecipe(formDataToSend));
      if (!result.error) {
        navigate('/my-recipes');
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold  text-gray-900 mb-8">Ajouter une recette</h1>

        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Informations de base */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre de la recette *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps (minutes)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <option value="Facile">Facile</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Difficile">Difficile</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Ex: Entrée, Plat, Dessert..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Ingrédients */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Ingrédients</h2>
            
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nom (ex: farine)"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Quantité (ex: 500)"
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Unité (ex: g)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-200 rounded-md"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addIngredient}
              className="mt-2 text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-4 py-2 rounded-md"
            >
              + Ajouter un ingrédient
            </button>
          </div>

          {/* Étapes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Étapes</h2>
            
            {formData.steps.map((step, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <span className="w-8 text-gray-500">{index + 1}.</span>
                <textarea
                  rows="2"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                />
                {formData.steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-200 rounded-md"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={addStep}
              className="mt-2 text-indigo-600 hover:text-indigo-800 border border-indigo-200 px-4 py-2 rounded-md"
            >
              + Ajouter une étape
            </button>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Tags</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Ajouter un tag (ex: végétarien, rapide...)"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Ajouter
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-gray-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Image de la recette</h2>
            
            <div className="space-y-4">
              {imagePreview && (
                <div className="mb-4">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    className="max-h-48 rounded-lg object-cover"
                  />
                </div>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="text-sm text-gray-500">
                Formats acceptés : JPEG, PNG, GIF (max 5 Mo)
              </p>
            </div>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Publication...' : 'Publier la recette'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRecipe;