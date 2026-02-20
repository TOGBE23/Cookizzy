import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
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
import autoTable from 'jspdf-autotable';
import ConfirmModal from '../components/ConfirmModal';

const ShoppingList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { selectedRecipes, shoppingList, checkedItems, recipesData } = useSelector((state) => state.shopping);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [notificationShown, setNotificationShown] = useState(false);

  // Charger les données des recettes sélectionnées
  useEffect(() => {
    const loadSelectedRecipes = async () => {
      if (selectedRecipes.length === 0) {
        setRecipes([]);
        setLoading(false);
        setInitialLoadDone(true);
        return;
      }

      if (recipesData.length === selectedRecipes.length && initialLoadDone) {
        setRecipes(recipesData);
        return;
      }

      setLoading(true);
      try {
        const recipesPromises = selectedRecipes.map(id => api.get(`/recipes/${id}`));
        const responses = await Promise.all(recipesPromises);
        const recipesDataFromApi = responses.map(res => res.data);
        
        setRecipes(recipesDataFromApi);
        
        recipesDataFromApi.forEach(recipe => {
          if (!recipesData.find(r => r.id === recipe.id)) {
            dispatch(addRecipeData(recipe));
          }
        });
        
        dispatch(generateShoppingList());
        
        if (!notificationShown) {
          toast.success('Liste de courses chargée !', {
            position: 'bottom-center',
            duration: 2000,
            id: 'shopping-list-loaded'
          });
          setNotificationShown(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des recettes:', error);
        toast.error('Erreur lors du chargement des recettes', {
          id: 'shopping-list-error'
        });
      } finally {
        setLoading(false);
        setInitialLoadDone(true);
      }
    };

    loadSelectedRecipes();
  }, [selectedRecipes, dispatch, notificationShown, recipesData, initialLoadDone]);

  // Mettre à jour recipes quand recipesData change
  useEffect(() => {
    if (recipesData.length > 0) {
      setRecipes(recipesData);
      setLoading(false);
      setInitialLoadDone(true);
    }
  }, [recipesData]);

  // Réinitialiser notificationShown quand selectedRecipes change
  useEffect(() => {
    setNotificationShown(false);
  }, [selectedRecipes]);

  // Fonction simple pour nettoyer les caractères spéciaux
  const cleanText = (text) => {
    if (!text) return '';
    
    // Convertir en string
    let clean = String(text);
    
    // Remplacer les caractères problématiques courants
    const replacements = {
      'é': 'e',
      'è': 'e',
      'ê': 'e',
      'ë': 'e',
      'à': 'a',
      'â': 'a',
      'ä': 'a',
      'ï': 'i',
      'î': 'i',
      'ö': 'o',
      'ô': 'o',
      'ù': 'u',
      'û': 'u',
      'ü': 'u',
      'ç': 'c',
      'ÿ': 'y',
      'œ': 'oe',
      'æ': 'ae',
      '€': 'Euro',
      '£': 'Livre',
      '¥': 'Yen',
      '°': 'degre',
      'Ø': 'O',
      'ß': 'ss',
      '—': '-',
      '–': '-',
      '…': '...'
    };
    
    for (const [bad, good] of Object.entries(replacements)) {
      clean = clean.split(bad).join(good);
    }
    
    // Supprimer les caractères non imprimables
    clean = clean.replace(/[^\x20-\x7E\s\-.,!?;:()]/g, '');
    
    return clean;
  };

  // Exporter en PDF simple et efficace
  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const today = new Date();
      const dateStr = today.toLocaleDateString('fr-FR');
      
      // === TITRE ===
      doc.setFontSize(22);
      doc.setTextColor(139, 90, 43); // Marron
      doc.setFont('helvetica', 'bold');
      doc.text('MA LISTE DE COURSES', 105, 20, { align: 'center' });
      
      // === INFORMATIONS ===
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date : ${dateStr}`, 14, 35);
      
      if (user) {
        doc.text(`Utilisateur : ${cleanText(user.username)}`, 14, 42);
      }
      
      // === RECETTES SÉLECTIONNÉES ===
      let yPos = 55;
      
      doc.setFontSize(12);
      doc.setTextColor(139, 90, 43);
      doc.setFont('helvetica', 'bold');
      doc.text('Recettes :', 14, yPos);
      yPos += 7;
      
      if (recipes.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'normal');
        
        recipes.forEach((recipe) => {
          let title = cleanText(recipe.title || '');
          
          if (title.length > 50) {
            title = title.substring(0, 47) + '...';
          }
          
          doc.text(`- ${title}`, 20, yPos);
          yPos += 5;
        });
        
        yPos += 5;
      }
      
      // === TABLEAU DES INGRÉDIENTS ===
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      // Préparer les données du tableau
      const tableData = shoppingList.map((item, index) => {
        const checked = checkedItems[index] ? '✓' : '☐';
        const ingredientName = cleanText(item.name || '');
        const quantity = cleanText(item.quantity || '');
        const unit = cleanText(item.unit || '');
        
        const qtyText = unit ? `${quantity} ${unit}` : quantity;
        
        return [index + 1, ingredientName, qtyText, checked];
      });

      // Générer le tableau
      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Ingrédient', 'Quantité', '']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [196, 164, 132],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 50, halign: 'center' },
          3: { cellWidth: 15, halign: 'center' }
        }
      });

      // === RÉSUMÉ ===
      const finalY = doc.lastAutoTable.finalY + 10;
      
      const totalItems = shoppingList.length;
      const checkedCount = Object.values(checkedItems).filter(Boolean).length;
      const remainingCount = totalItems - checkedCount;
      
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Total : ${totalItems} ingrédients`, 14, finalY);
      doc.text(`Achetés : ${checkedCount}`, 14, finalY + 7);
      doc.text(`Restants : ${remainingCount}`, 14, finalY + 14);
      
      // === PIED DE PAGE ===
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Généré par Cookizzy - Page ${i}/${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Sauvegarder
      const dateForFileName = today.toISOString().split('T')[0];
      const userName = user ? cleanText(user.username).replace(/\s+/g, '-') : 'invite';
      doc.save(`Cookizzy-Liste-${userName}-${dateForFileName}.pdf`);
      
      toast.success('PDF généré avec succès !', {
        position: 'bottom-center',
        duration: 2000,
        icon: '📄'
      });
      
    } catch (error) {
      console.error('Erreur PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  // Calculer la progression
  const getProgress = () => {
    const total = shoppingList.length;
    if (total === 0) return 0;
    const checked = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  };

  // Grouper les ingrédients par catégorie
  const groupedIngredients = shoppingList.reduce((acc, item) => {
    let category = 'Autre';
    const name = item.name.toLowerCase();
    
    if (['farine', 'sucre', 'sel', 'poivre', 'épice', 'levure', 'huile', 'vinaigre'].some(key => name.includes(key))) {
      category = 'Épicerie';
    } else if (['oeuf', 'lait', 'beurre', 'crème', 'fromage', 'yaourt'].some(key => name.includes(key))) {
      category = 'Produits laitiers';
    } else if (['poulet', 'boeuf', 'veau', 'porc', 'agneau', 'viande', 'steak'].some(key => name.includes(key))) {
      category = 'Viandes';
    } else if (['poisson', 'saumon', 'thon', 'crevette', 'cabillaud'].some(key => name.includes(key))) {
      category = 'Poissons';
    } else if (['pomme', 'banane', 'orange', 'fraise', 'fruit', 'citron', 'kiwi'].some(key => name.includes(key))) {
      category = 'Fruits';
    } else if (['carotte', 'tomate', 'oignon', 'salade', 'legume', 'courgette', 'aubergine', 'poivron'].some(key => name.includes(key))) {
      category = 'Légumes';
    } else if (['pain', 'baguette', 'brioche', 'croissant'].some(key => name.includes(key))) {
      category = 'Boulangerie';
    } else if (['eau', 'soda', 'jus', 'cafe', 'the'].some(key => name.includes(key))) {
      category = 'Boissons';
    }
    
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const handleClearList = () => {
    dispatch(clearShoppingList());
    setShowClearConfirm(false);
    toast.success('Liste de courses vidée', {
      position: 'bottom-center',
      duration: 2000,
      id: 'clear-success'
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 transition-colors duration-300 pt-4">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 sm:p-6"
        >
          {/* En-tête */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700 dark:text-white">🛒 Ma liste de courses</h1>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-gray-300 mt-1">
                {selectedRecipes.length} recette{selectedRecipes.length > 1 ? 's' : ''} sélectionnée{selectedRecipes.length > 1 ? 's' : ''}
              </p>
            </div>
            
            {selectedRecipes.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowClearConfirm(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-white hover:opacity-90 transition flex items-center justify-center gap-2"
                style={{backgroundColor: '#ffb6c1'}}
              >
                🗑️ Vider la liste
              </motion.button>
            )}
          </div>

          {/* Sélection des recettes */}
          <div className="mb-8 p-4 rounded-lg bg-secondary-100 dark:bg-gray-700">
            <h2 className="text-lg font-semibold mb-3 text-neutral-700 dark:text-white">Recettes sélectionnées</h2>
            
            {selectedRecipes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Aucune recette sélectionnée.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/my-recipes')}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Aller dans "Mes recettes"
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <AnimatePresence>
                  {recipes.map(recipe => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-2 rounded bg-white dark:bg-gray-600"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        {recipe.imageUrl ? (
                          <img 
                            src={`http://localhost:5000${recipe.imageUrl}`} 
                            alt={recipe.title}
                            className="w-10 h-10 object-cover rounded mr-3 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-500 rounded mr-3 flex items-center justify-center flex-shrink-0">
                            <span>🍳</span>
                          </div>
                        )}
                        <span className="truncate text-neutral-700 dark:text-white">{recipe.title}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => dispatch(removeRecipeFromSelection(recipe.id))}
                        className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                      >
                        ✕
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Barre de progression */}
          {shoppingList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-white">Progression</span>
                <span className="text-sm font-medium text-neutral-700 dark:text-white">{getProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgress()}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-3 rounded-full"
                  style={{ backgroundColor: '#ffb6c1' }}
                />
              </div>
            </motion.div>
          )}

          {/* Liste de courses */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-neutral-600 dark:text-gray-300">Chargement...</p>
            </div>
          ) : shoppingList.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                <button
                  onClick={() => dispatch(toggleAllItems(true))}
                  className="px-4 py-2 rounded-lg text-white"
                  style={{backgroundColor: '#c4a484'}}
                >
                  Tout cocher
                </button>
                <button
                  onClick={() => dispatch(toggleAllItems(false))}
                  className="px-4 py-2 rounded-lg text-white"
                  style={{backgroundColor: '#a8a8a8'}}
                >
                  Tout décocher
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 rounded-lg text-white"
                  style={{backgroundColor: '#ffb347'}}
                >
                  📄 Exporter PDF
                </button>
              </div>

              {/* Ingrédients groupés */}
              {Object.entries(groupedIngredients)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, items]) => (
                  <div key={category} className="mb-6">
                    <h3 className="font-semibold mb-3 text-lg text-neutral-700 dark:text-white">
                      {category} ({items.length})
                    </h3>
                    <div className="space-y-2">
                      {items.map((item, idx) => {
                        const globalIndex = shoppingList.findIndex(i => i.name === item.name && i.unit === item.unit);
                        return (
                          <div key={idx} className="flex items-center p-2 rounded bg-neutral-50 dark:bg-gray-700">
                            <input
                              type="checkbox"
                              checked={checkedItems[globalIndex] || false}
                              onChange={() => dispatch(toggleCheckedItem(globalIndex))}
                              className="h-5 w-5 mr-3 cursor-pointer"
                              style={{accentColor: '#ffb6c1'}}
                            />
                            <span className="flex-1 text-neutral-700 dark:text-white">
                              {item.name}
                            </span>
                            <span className="px-3 py-1 rounded-full text-sm bg-white dark:bg-gray-600 text-neutral-700 dark:text-white">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </motion.div>
          ) : null}
        </motion.div>
      </div>

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearList}
        title="Vider la liste"
        message="Êtes-vous sûr de vouloir vider votre liste de courses ?"
        confirmText="Oui, vider"
        cancelText="Annuler"
      />
    </div>
  );
};

export default ShoppingList;