#!/bin/bash

# Script de déploiement du système de Favoris (Phase 10)
# Déploie les règles Firestore et les indexes pour la collection favorites

set -e

echo "🚀 Déploiement du système de Favoris..."
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI n'est pas installé${NC}"
    echo "Installez-le avec: npm install -g firebase-tools"
    exit 1
fi

echo -e "${BLUE}📋 Vérification des fichiers...${NC}"

# Vérifier que les fichiers existent
if [ ! -f "firestore.rules" ]; then
    echo -e "${RED}❌ firestore.rules introuvable${NC}"
    exit 1
fi

if [ ! -f "firestore.indexes.json" ]; then
    echo -e "${RED}❌ firestore.indexes.json introuvable${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Fichiers présents${NC}"
echo ""

# Afficher les règles favorites
echo -e "${BLUE}📝 Règles de sécurité Favorites (lignes 253-283):${NC}"
sed -n '253,283p' firestore.rules | head -20
echo ""

# Afficher les indexes favorites
echo -e "${BLUE}📊 Index composites Favorites:${NC}"
echo "1. userId ASC + createdAt DESC"
echo "2. userId ASC + itemType ASC + createdAt DESC"
echo ""

# Demander confirmation
echo -e "${YELLOW}⚠️  Êtes-vous sûr de vouloir déployer ?${NC}"
echo "Cela va mettre à jour les règles Firestore et créer les indexes."
read -p "Continuer ? (o/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo -e "${YELLOW}❌ Déploiement annulé${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔐 Déploiement des règles Firestore...${NC}"
firebase deploy --only firestore:rules

echo ""
echo -e "${BLUE}📊 Déploiement des indexes Firestore...${NC}"
firebase deploy --only firestore:indexes

echo ""
echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo ""
echo -e "${BLUE}📚 Prochaines étapes:${NC}"
echo "1. Vérifier les règles dans la console Firebase"
echo "2. Attendre la création des indexes (peut prendre quelques minutes)"
echo "3. Tester l'ajout/suppression de favoris dans l'app"
echo ""
echo -e "${GREEN}🎉 Le système de Favoris est maintenant déployé !${NC}"
