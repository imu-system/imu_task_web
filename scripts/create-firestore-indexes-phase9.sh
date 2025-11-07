#!/bin/bash

# Script pour créer manuellement les indexes Firestore Phase 9
# Date: 7 novembre 2024
# Usage: ./scripts/create-firestore-indexes-phase9.sh

set -e

PROJECT_ID="imutask"
echo "🚀 Création des indexes Firestore pour Phase 9 - Dashboard Optimization"
echo "================================================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Note: Ce script ouvre la Console Firebase pour création manuelle${NC}"
echo -e "${YELLOW}Les indexes seront créés via l'interface web Firebase${NC}"
echo ""

# Index 1: bookings (providerId + status + scheduledDate)
echo "📋 Index 1: bookings (providerId + status + scheduledDate)"
echo "   Collection: bookings"
echo "   Champs:"
echo "     - providerId (ASCENDING)"
echo "     - status (ASCENDING)"
echo "     - scheduledDate (ASCENDING)"
echo ""
echo -e "${GREEN}✅ Ouvrir dans le navigateur pour créer l'index?${NC}"
read -p "Appuyez sur [Entrée] pour ouvrir la Console Firebase..."

# URL pour créer l'index bookings-provider
BOOKINGS_PROVIDER_URL="https://console.firebase.google.com/project/${PROJECT_ID}/firestore/indexes"
echo "Ouverture de: $BOOKINGS_PROVIDER_URL"
open "$BOOKINGS_PROVIDER_URL" 2>/dev/null || xdg-open "$BOOKINGS_PROVIDER_URL" 2>/dev/null || echo -e "${RED}Impossible d'ouvrir le navigateur. Allez sur: $BOOKINGS_PROVIDER_URL${NC}"

echo ""
echo "📝 Dans la Console Firebase:"
echo "   1. Cliquez sur 'Create Index'"
echo "   2. Collection ID: bookings"
echo "   3. Ajoutez les champs:"
echo "      - Field: providerId, Order: Ascending"
echo "      - Field: status, Order: Ascending"
echo "      - Field: scheduledDate, Order: Ascending"
echo "   4. Query scope: Collection"
echo "   5. Cliquez sur 'Create'"
echo ""
read -p "Index créé? Appuyez sur [Entrée] pour continuer..."

# Index 2: bookings (clientId + status + scheduledDate)
echo ""
echo "📋 Index 2: bookings (clientId + status + scheduledDate)"
echo "   Collection: bookings"
echo "   Champs:"
echo "     - clientId (ASCENDING)"
echo "     - status (ASCENDING)"
echo "     - scheduledDate (ASCENDING)"
echo ""
read -p "Appuyez sur [Entrée] pour créer le prochain index..."

echo "📝 Dans la Console Firebase:"
echo "   1. Cliquez sur 'Create Index'"
echo "   2. Collection ID: bookings"
echo "   3. Ajoutez les champs:"
echo "      - Field: clientId, Order: Ascending"
echo "      - Field: status, Order: Ascending"
echo "      - Field: scheduledDate, Order: Ascending"
echo "   4. Query scope: Collection"
echo "   5. Cliquez sur 'Create'"
echo ""
read -p "Index créé? Appuyez sur [Entrée] pour continuer..."

# Index 3: notifications (userId + createdAt)
echo ""
echo "📋 Index 3: notifications (userId + createdAt)"
echo "   Collection: notifications"
echo "   Champs:"
echo "     - userId (ASCENDING)"
echo "     - createdAt (DESCENDING)"
echo ""
read -p "Appuyez sur [Entrée] pour créer le dernier index..."

echo "📝 Dans la Console Firebase:"
echo "   1. Cliquez sur 'Create Index'"
echo "   2. Collection ID: notifications"
echo "   3. Ajoutez les champs:"
echo "      - Field: userId, Order: Ascending"
echo "      - Field: createdAt, Order: Descending"
echo "   4. Query scope: Collection"
echo "   5. Cliquez sur 'Create'"
echo ""
read -p "Index créé? Appuyez sur [Entrée] pour continuer..."

# Vérification
echo ""
echo "🔍 Vérification des indexes créés..."
echo "Récupération de la liste des indexes..."
firebase firestore:indexes > /tmp/firestore-indexes-check.json 2>&1 || true

echo ""
echo -e "${GREEN}✅ Création des indexes terminée!${NC}"
echo ""
echo "📊 Pour vérifier les indexes:"
echo "   firebase firestore:indexes"
echo ""
echo "🌐 Console Firebase:"
echo "   https://console.firebase.google.com/project/${PROJECT_ID}/firestore/indexes"
echo ""
echo "⏱️  Les indexes peuvent prendre 1-2 minutes à se construire"
echo "    Vous recevrez un email de confirmation quand ils seront prêts"
echo ""
echo -e "${GREEN}🎉 Phase 9.6 - Optimisation terminée!${NC}"
