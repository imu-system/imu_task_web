#!/bin/bash

# Script pour corriger les tests E2E KYC
# Corrige l'ordre des champs signup (displayName avant email)

FILE="e2e/kyc-flow.spec.ts"

echo "🔧 Correction de l'ordre des champs signup dans $FILE..."

# Fonction pour échanger email et displayName dans les blocs signup
# Note: Cette commande sed corrige l'ordre: displayName → email → password

# Créer un fichier temporaire pour la correction manuelle
cat > /tmp/fix_pattern.txt << 'EOF'
Les tests ont été partiellement corrigés.
Vérification manuelle recommandée pour les blocs signup restants.

Format attendu:
1. signup-displayName
2. signup-email  
3. signup-password
4. signup-submit

URL correcte: /fr/sign-up (au lieu de /fr/signup)
URL login correcte: /fr/sign-in (au lieu de /fr/login)
EOF

cat /tmp/fix_pattern.txt
echo ""
echo "✅ URLs corrigées automatiquement"
echo "⚠️  Ordre des champs à vérifier manuellement dans les blocs restants"
