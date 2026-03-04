import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRecipe } from '../store/slices/recipeSlice';

const AddRecipeForm = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
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
  const [imagePreview, setImagePreview] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imageError, setImageError] = useState('');

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
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageError('');
    if (file) {
      // Limite à 1MB pour Vercel serverless
      if (file.size > 1 * 1024 * 1024) {
        setImageError('Image trop volumineuse (max 1MB). Compressez votre image avant de l\'uploader.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
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

    const dataToSend = {
      title: formData.title,
      description: formData.description || '',
      ingredients: validIngredients,
      steps: validSteps,
      prepTime: formData.prepTime || '',
      difficulty: formData.difficulty,
      category: formData.category || '',
      tags: formData.tags,
      imageUrl: imageBase64 || null
    };

    const result = await dispatch(addRecipe(dataToSend));
    if (!result.error) {
      onSuccess?.();
      onClose();
      setFormData({
        title: '',
        description: '',
        ingredients: [{ name: '', quantity: '', unit: '' }],
        steps: [''],
        prepTime: '',
        difficulty: 'Facile',
        category: '',
        tags: []
      });
      setImageBase64('');
      setImagePreview('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={{color: '#8b5a2b'}}>Informations générales</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la recette *</label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Temps (minutes)</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.prepTime}
              onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulté</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ex: Entrée, Plat, Dessert..."
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
      </div>

      {/* Image */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{color: '#8b5a2b'}}>Image</h3>
        {imagePreview && (
          <div className="mb-3">
            <img src={imagePreview} alt="Aperçu" className="max-h-32 rounded-lg object-cover" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {imageError && (
          <p className="text-red-500 text-sm mt-1">{imageError}</p>
        )}
        <p className="text-gray-400 text-xs mt-1">Maximum 1MB. Utilisez <a href="https://squoosh.app" target="_blank" rel="noreferrer" className="underline">squoosh.app</a> pour compresser.</p>
      </div>

      {/* Ingrédients */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{color: '#8b5a2b'}}>Ingrédients</h3>
        {formData.ingredients.map((ingredient, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 mb-2">
            <input
              type="text"
              placeholder="Nom"
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={ingredient.name}
              onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
            />
            <input
              type="text"
              placeholder="Quantité"
              className="px-3 py-2 border border-gray-300 rounded-md"
              value={ingredient.quantity}
              onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Unité"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                value={ingredient.unit}
                onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
              />
              {formData.ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredient(index)} className="px-3 py-2 text-red-600 hover:text-red-800">×</button>
              )}
            </div>
          </div>
        ))}
        <button type="button" onClick={addIngredient} className="mt-2 text-sm px-3 py-1 rounded-md hover:opacity-80" style={{color: '#8b5a2b', backgroundColor: '#ffd8b0'}}>
          + Ajouter un ingrédient
        </button>
      </div>

      {/* Étapes */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{color: '#8b5a2b'}}>Étapes</h3>
        {formData.steps.map((step, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <span className="w-6 text-gray-500">{index + 1}.</span>
            <textarea
              rows="1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              value={step}
              onChange={(e) => handleStepChange(index, e.target.value)}
            />
            {formData.steps.length > 1 && (
              <button type="button" onClick={() => removeStep(index)} className="px-3 py-2 text-red-600 hover:text-red-800">×</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addStep} className="mt-2 text-sm px-3 py-1 rounded-md hover:opacity-80" style={{color: '#8b5a2b', backgroundColor: '#ffd8b0'}}>
          + Ajouter une étape
        </button>
      </div>

      {/* Tags */}
      <div>
        <h3 className="text-lg font-semibold mb-3" style={{color: '#8b5a2b'}}>Tags</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Ajouter un tag"
          />
          <button type="button" onClick={addTag} className="px-4 py-2 rounded-md text-white hover:opacity-80" style={{backgroundColor: '#c4a484'}}>
            Ajouter
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <span key={tag} className="px-2 py-1 rounded-full text-sm flex items-center" style={{backgroundColor: '#ffd8b0', color: '#8b5a2b'}}>
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-gray-500 hover:text-red-600">×</button>
            </span>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>}

      <div className="flex gap-3 pt-4">
        <button type="button" onClick={onClose} className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:opacity-80 transition">
          Annuler
        </button>
        <button type="submit" disabled={isLoading} className="flex-1 text-white py-2 px-4 rounded-md hover:opacity-80 transition disabled:opacity-50" style={{backgroundColor: '#c4a484'}}>
          {isLoading ? 'Publication...' : 'Publier'}
        </button>
      </div>
    </form>
  );
};

export default AddRecipeForm;
