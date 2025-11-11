#!/bin/bash
# Script pour lancer les tests E2E avec vérification du dev server

set -e

echo "🔍 Vérification du dev server sur http://localhost:9002..."

# Attendre que le serveur réponde (max 30 secondes)
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:9002 > /dev/null 2>&1; then
        echo "✅ Dev server prêt!"
        break
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
    echo "⏳ Attente... ($ATTEMPT/$MAX_ATTEMPTS)"
    sleep 1
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "❌ Erreur: Le dev server ne répond pas sur http://localhost:9002"
    echo "💡 Assurez-vous qu'il tourne avec: pnpm dev"
    exit 1
fi

echo ""
echo "🧪 Lancement des tests E2E favoris..."
echo ""

# Lancer les tests avec les bons paramètres
pnpm exec playwright test e2e/favorites.spec.ts \
    --timeout=60000 \
    --reporter=list \
    --workers=1

echo ""
echo "✅ Tests terminés!"
