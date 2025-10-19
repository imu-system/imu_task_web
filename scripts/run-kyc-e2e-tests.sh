#!/bin/bash

# Script pour exécuter les tests E2E KYC
# Usage: ./scripts/run-kyc-e2e-tests.sh

echo "🧪 Préparation des tests E2E KYC..."

# Vérifier que les fixtures existent
if [ ! -d "e2e/fixtures" ]; then
    echo "❌ Erreur: Le dossier e2e/fixtures n'existe pas"
    echo "📝 Exécutez d'abord: node scripts/generate-fixtures.js"
    exit 1
fi

echo "✅ Fixtures trouvées"

# Vérifier que le serveur tourne ou utiliser le webServer de Playwright
echo "🚀 Lancement des tests E2E KYC..."

# Lancer les tests avec Playwright
npx playwright test e2e/kyc-flow.spec.ts --project=chromium

# Afficher le rapport si les tests échouent
if [ $? -ne 0 ]; then
    echo "❌ Certains tests ont échoué"
    echo "📊 Ouverture du rapport de test..."
    npx playwright show-report
else
    echo "✅ Tous les tests sont passés!"
    echo "📊 Pour voir le rapport détaillé:"
    echo "   npx playwright show-report"
fi
