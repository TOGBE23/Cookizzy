import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  removeRecipeFromSelection, 
  addRecipeData,
  generateShoppingList, 
  toggleCheckedItem,
  toggleAllItems,
  clearShoppingList 
} from '../store/slices/shoppingSlice';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ShoppingList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { selectedRecipes, shoppingList, checkedItems, recipesData } = useSelector((state) => state.shopping);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);

  // Charger les données des recettes sélectionnées
  useEffect(() => {
    const loadSelectedRecipes = async () => {
      if (selectedRecipes.length === 0) {
        setRecipes([]);
        return;
      }

      setLoading(true);
      try {
        const recipesPromises = selectedRecipes.map(id => api.get(`/recipes/${id}`));
        const responses = await Promise.all(recipesPromises);
        const recipesData = responses.map(res => res.data);
        
        setRecipes(recipesData);
        
        recipesData.forEach(recipe => {
          dispatch(addRecipeData(recipe));
        });
        
        dispatch(generateShoppingList());
      } catch (error) {
        console.error('Erreur lors du chargement des recettes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSelectedRecipes();
  }, [selectedRecipes, dispatch]);

  // Exporter en PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setTextColor(180, 90, 50);
      doc.text('📝 Ma liste de courses', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const today = new Date();
      const dateStr = today.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      doc.text(`Générée le ${dateStr}`, 14, 32);
      
      if (user) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Par : ${user.username}`, 14, 40);
      }
      
      let yPos = 50;
      if (recipes.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Recettes sélectionnées :', 14, yPos);
        yPos += 7;
        
        recipes.forEach((recipe) => {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`• ${recipe.title}`, 20, yPos);
          yPos += 6;
        });
        
        yPos += 5;
      }
      
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      const tableData = shoppingList.map((item, index) => {
        const checked = checkedItems[index] ? '✓' : '☐';
        return [
          index + 1,
          item.name,
          `${item.quantity} ${item.unit}`,
          checked
        ];
      });

      doc.autoTable({
        startY: yPos,
        head: [['#', 'Ingrédient', 'Quantité', 'Acheté']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [196, 164, 132],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { 
          fillColor: [245, 240, 232]
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 80 },
          2: { cellWidth: 50 },
          3: { cellWidth: 30 }
        }
      });

      const totalItems = shoppingList.length;
      const checkedCount = Object.values(checkedItems).filter(Boolean).length;
      const remainingCount = totalItems - checkedCount;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Total : ${totalItems} ingrédients`, 14, doc.lastAutoTable.finalY + 10);
      doc.text(`Déjà achetés : ${checkedCount}`, 14, doc.lastAutoTable.finalY + 17);
      doc.text(`Restants : ${remainingCount}`, 14, doc.lastAutoTable.finalY + 24);

      doc.save(`liste-courses-${today.toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  const getProgress = () => {
    const total = shoppingList.length;
    if (total === 0) return 0;
    const checked = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  };

  const groupedIngredients = shoppingList.reduce((acc, item) => {
    let category = 'Autre';
    const name = item.name.toLowerCase();
    
    if (['farine', 'sucre', 'sel', 'poivre', 'épice', 'levure', 'huile', 'vinaigre'].some(key => name.includes(key))) {
      category = 'Épicerie';
    } else if (['œuf', 'lait', 'beurre', 'crème', 'fromage', 'yaourt'].some(key => name.includes(key))) {
      category = 'Produits laitiers';
    } else if (['poulet', 'boeuf', 'veau', 'porc', 'agneau', 'viande', 'steak'].some(key => name.includes(key))) {
      category = 'Viandes';
    } else if (['poisson', 'saumon', 'thon', 'crevette', 'fruit de mer', 'cabillaud'].some(key => name.includes(key))) {
      category = 'Poissons & Fruits de mer';
    } else if (['pomme', 'banane', 'orange', 'fraise', 'fruit', 'citron', 'kiwi'].some(key => name.includes(key))) {
      category = 'Fruits';
    } else if (['carotte', 'tomate', 'oignon', 'salade', 'légume', 'courgette', 'aubergine', 'poivron'].some(key => name.includes(key))) {
      category = 'Légumes';
    } else if (['pain', 'baguette', 'brioche', 'croissant'].some(key => name.includes(key))) {
      category = 'Boulangerie';
    } else if (['eau', 'soda', 'jus', 'café', 'thé'].some(key => name.includes(key))) {
      category = 'Boissons';
    }
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f5f0e8'}}>
      {/* PLUS DE NAVBAR ICI - ELLE EST DANS App.js */}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-lg shadow p-6" style={{backgroundColor: '#ffffff'}}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold" style={{color: '#8b5a2b'}}>🛒 Ma liste de courses</h1>
              <p className="mt-1" style={{color: '#a0522d'}}>
                {selectedRecipes.length} recette{selectedRecipes.length > 1 ? 's' : ''} sélectionnée{selectedRecipes.length > 1 ? 's' : ''}
              </p>
            </div>
            
            {selectedRecipes.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Vider la liste de courses ?')) {
                    dispatch(clearShoppingList());
                  }
                }}
                className="px-4 py-2 rounded-md text-white hover:opacity-80 transition flex items-center gap-2"
                style={{backgroundColor: '#ffb6c1'}}
              >
                🗑️ Vider la liste
              </button>
            )}
          </div>

          {/* Sélection des recettes */}
          <div className="mb-8 p-4 rounded-lg" style={{backgroundColor: '#ffd8b0'}}>
            <h2 className="text-lg font-semibold mb-3" style={{color: '#8b5a2b'}}>Recettes sélectionnées</h2>
            
            {selectedRecipes.length === 0 ? (
              <p className="text-gray-600 italic py-4 text-center">
                Aucune recette sélectionnée. 
                <br />
                <button
                  onClick={() => navigate('/my-recipes')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium underline mt-2"
                >
                  Aller dans "Mes recettes"
                </button>
                {' '}et cliquez sur le bouton "🛒 Liste" pour ajouter des recettes.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recipes.map(recipe => (
                  <div key={recipe.id} className="flex items-center justify-between p-2 rounded" style={{backgroundColor: '#fff9e6'}}>
                    <div className="flex items-center flex-1 min-w-0">
                      {recipe.imageUrl ? (
                        <img 
                          src={`http://localhost:5000${recipe.imageUrl}`} 
                          alt={recipe.title}
                          className="w-10 h-10 object-cover rounded mr-3 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded mr-3 flex items-center justify-center flex-shrink-0">
                          <span>🍳</span>
                        </div>
                      )}
                      <span className="truncate" style={{color: '#8b5a2b'}}>{recipe.title}</span>
                    </div>
                    <button
                      onClick={() => dispatch(removeRecipeFromSelection(recipe.id))}
                      className="ml-2 text-red-600 hover:text-red-800 flex-shrink-0"
                      title="Retirer de la liste"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Barre de progression */}
          {shoppingList.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium" style={{color: '#8b5a2b'}}>Progression des achats</span>
                <span className="text-sm font-medium" style={{color: '#8b5a2b'}}>{getProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getProgress()}%`, backgroundColor: '#ffb6c1' }}
                ></div>
              </div>
              <div className="flex justify-between text-xs mt-1" style={{color: '#a0522d'}}>
                <span>{Object.values(checkedItems).filter(Boolean).length} acheté(s)</span>
                <span>{shoppingList.length - Object.values(checkedItems).filter(Boolean).length} restant(s)</span>
              </div>
            </div>
          )}

          {/* Liste de courses */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{borderColor: '#c4a484'}}></div>
              <p className="mt-4" style={{color: '#8b5a2b'}}>Chargement de votre liste...</p>
            </div>
          ) : shoppingList.length > 0 ? (
            <div>
              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => dispatch(toggleAllItems(true))}
                  className="px-4 py-2 rounded-md text-white hover:opacity-80 transition flex items-center gap-2"
                  style={{backgroundColor: '#c4a484'}}
                >
                  ✓ Tout cocher
                </button>
                <button
                  onClick={() => dispatch(toggleAllItems(false))}
                  className="px-4 py-2 rounded-md text-white hover:opacity-80 transition flex items-center gap-2"
                  style={{backgroundColor: '#a8a8a8'}}
                >
                  ☐ Tout décocher
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 rounded-md text-white hover:opacity-80 transition flex items-center gap-2"
                  style={{backgroundColor: '#ffb347'}}
                >
                  📄 Exporter en PDF
                </button>
              </div>

              {/* Ingrédients groupés par catégorie */}
              {Object.entries(groupedIngredients)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h3 className="font-semibold mb-3 text-lg pb-1 border-b" style={{color: '#8b5a2b', borderColor: '#ffb6c1'}}>
                    {category} <span className="text-sm font-normal ml-2" style={{color: '#a0522d'}}>({items.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {items.map((item, idx) => {
                      const globalIndex = shoppingList.findIndex(i => i.name === item.name && i.unit === item.unit);
                      return (
                        <div 
                          key={idx} 
                          className="flex items-center p-2 rounded transition hover:shadow-sm"
                          style={{backgroundColor: '#f5f0e8'}}
                        >
                          <input
                            type="checkbox"
                            checked={checkedItems[globalIndex] || false}
                            onChange={() => dispatch(toggleCheckedItem(globalIndex))}
                            className="h-5 w-5 mr-3 cursor-pointer"
                            style={{accentColor: '#ffb6c1'}}
                          />
                          <span className="flex-1" style={{color: checkedItems[globalIndex] ? '#a8a8a8' : '#8b5a2b', textDecoration: checkedItems[globalIndex] ? 'line-through' : 'none'}}>
                            {item.name}
                          </span>
                          <span className="font-medium px-3 py-1 rounded-full text-sm" style={{backgroundColor: '#fff9e6', color: '#8b5a2b'}}>
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            selectedRecipes.length > 0 && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{borderColor: '#c4a484'}}></div>
                <p className="mt-4 text-gray-500">Génération de la liste en cours...</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;