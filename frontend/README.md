# 🍪 Cookizzy - Plateforme de Partage de Recettes

Cookizzy est une application web complète de partage de recettes avec recherche avancée et liste de courses automatique.

## ✨ Fonctionnalités

### 👤 Authentification & Profil
- Inscription / Connexion avec JWT
- Gestion de profil avec photo
- Modification des informations
- Changement de mot de passe

### 📝 Gestion des recettes
- CRUD complet (Ajouter, Voir, Modifier, Supprimer)
- Upload d'images
- Ingrédients structurés (nom, quantité, unité)
- Étapes de préparation
- Temps et difficulté
- Catégories et tags

### 🔍 Recherche avancée
- Recherche par titre, description, tags
- Recherche par ingrédients
- Filtres par catégorie, durée, difficulté
- Élimination automatique des doublons

### 🛒 Liste de courses automatique
- Sélection multiple de recettes
- Extraction automatique des ingrédients
- Fusion des doublons et addition des quantités
- Cases à cocher interactives
- Export PDF

### ❤️ Interaction sociale
- Likes sur les recettes
- Commentaires avec suppression
- Notation par étoiles (⭐ 1-5)
- Note moyenne affichée

### 🎨 Interface utilisateur
- Design personnalisé aux couleurs chaudes
- Modals pour toutes les actions
- Messages de confirmation
- Notifications de succès
- Animations fluides

## 🛠️ Technologies

- **Frontend**: React, Redux Toolkit, Tailwind CSS
- **Backend**: Node.js, Express, SQLite3
- **Authentification**: JWT, Bcrypt
- **Export PDF**: jsPDF / jspdf-autotable

## 🚀 Installation

```bash
# Cloner le projet
git clone https://github.com/TOGBE23/cookizzy.git
cd cookizzy

# Installer le backend
cd backend
npm install
cp .env.example .env
npm run dev

# Installer le frontend
cd ../frontend
npm install
npm start