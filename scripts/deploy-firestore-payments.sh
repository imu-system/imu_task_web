#!/bin/bash

###############################################################################
# Script de déploiement Firestore - Collections Paiements
# Phase 1 : Paiements & Finances
#
# Usage: 
#   ./scripts/deploy-firestore-payments.sh [--dry-run] [--rules-only] [--indexes-only]
#
# Options:
#   --dry-run       Affiche les commandes sans les exécuter
#   --rules-only    Déploie uniquement les règles
#   --indexes-only  Déploie uniquement les indices
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
DRY_RUN=false
RULES_ONLY=false
INDEXES_ONLY=false

for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --rules-only)
      RULES_ONLY=true
      shift
      ;;
    --indexes-only)
      INDEXES_ONLY=true
      shift
      ;;
  esac
done

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Déploiement Firestore - Collections Paiements (Phase 1)     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

###############################################################################
# 1. Vérifications préalables
###############################################################################

echo -e "${YELLOW}[1/5] Vérifications préalables...${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI n'est pas installé.${NC}"
    echo -e "   Installez-le avec: ${BLUE}npm install -g firebase-tools${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Firebase CLI installé${NC}"

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}❌ Non connecté à Firebase.${NC}"
    echo -e "   Connectez-vous avec: ${BLUE}firebase login${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Connecté à Firebase${NC}"

# Check if files exist
if [ ! -f "firestore-payments.rules" ]; then
    echo -e "${RED}❌ Fichier firestore-payments.rules introuvable${NC}"
    exit 1
fi
echo -e "${GREEN}✅ firestore-payments.rules trouvé${NC}"

if [ ! -f "firestore-payments.indexes.json" ]; then
    echo -e "${RED}❌ Fichier firestore-payments.indexes.json introuvable${NC}"
    exit 1
fi
echo -e "${GREEN}✅ firestore-payments.indexes.json trouvé${NC}"

echo ""

###############################################################################
# 2. Backup des fichiers existants
###############################################################################

echo -e "${YELLOW}[2/5] Backup des fichiers existants...${NC}"

BACKUP_DIR="firestore-backup-$(date +%Y%m%d-%H%M%S)"

if [ "$DRY_RUN" = false ]; then
    mkdir -p "$BACKUP_DIR"
    
    if [ -f "firestore.rules" ]; then
        cp firestore.rules "$BACKUP_DIR/firestore.rules.backup"
        echo -e "${GREEN}✅ Backup de firestore.rules → $BACKUP_DIR/${NC}"
    fi
    
    if [ -f "firestore.indexes.json" ]; then
        cp firestore.indexes.json "$BACKUP_DIR/firestore.indexes.json.backup"
        echo -e "${GREEN}✅ Backup de firestore.indexes.json → $BACKUP_DIR/${NC}"
    fi
else
    echo -e "${BLUE}[DRY RUN] Créerait backup dans: $BACKUP_DIR/${NC}"
fi

echo ""

###############################################################################
# 3. Fusion des règles Firestore
###############################################################################

if [ "$INDEXES_ONLY" = false ]; then
    echo -e "${YELLOW}[3/5] Fusion des règles Firestore...${NC}"
    
    if [ "$DRY_RUN" = false ]; then
        # Check if firestore.rules exists
        if [ ! -f "firestore.rules" ]; then
            echo -e "${YELLOW}⚠️  firestore.rules n'existe pas, création...${NC}"
            echo "rules_version = '2';" > firestore.rules
            echo "" >> firestore.rules
            echo "service cloud.firestore {" >> firestore.rules
            echo "  match /databases/{database}/documents {" >> firestore.rules
            echo "    // Règles de base" >> firestore.rules
            echo "  }" >> firestore.rules
            echo "}" >> firestore.rules
        fi
        
        # Vérifier si les règles paiements sont déjà incluses
        if grep -q "TRANSACTIONS" firestore.rules; then
            echo -e "${YELLOW}⚠️  Les règles paiements semblent déjà présentes dans firestore.rules${NC}"
            read -p "   Remplacer? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo -e "${BLUE}   Annulé par l'utilisateur${NC}"
                exit 0
            fi
        fi
        
        echo -e "${BLUE}   Fusion manuelle requise:${NC}"
        echo -e "   1. Ouvrir ${BLUE}firestore.rules${NC}"
        echo -e "   2. Copier le contenu de ${BLUE}firestore-payments.rules${NC}"
        echo -e "   3. Fusionner les helper functions et les match{} blocks"
        echo ""
        read -p "   Appuyez sur Entrée quand la fusion est terminée..."
        
        echo -e "${GREEN}✅ Règles fusionnées (manuellement)${NC}"
    else
        echo -e "${BLUE}[DRY RUN] Fusionnerait firestore-payments.rules dans firestore.rules${NC}"
    fi
else
    echo -e "${BLUE}[3/5] Skipping rules (--indexes-only)${NC}"
fi

echo ""

###############################################################################
# 4. Fusion des indices Firestore
###############################################################################

if [ "$RULES_ONLY" = false ]; then
    echo -e "${YELLOW}[4/5] Fusion des indices Firestore...${NC}"
    
    if [ "$DRY_RUN" = false ]; then
        # Check if firestore.indexes.json exists
        if [ ! -f "firestore.indexes.json" ]; then
            echo -e "${YELLOW}⚠️  firestore.indexes.json n'existe pas, création...${NC}"
            echo '{"indexes": [], "fieldOverrides": []}' > firestore.indexes.json
        fi
        
        echo -e "${BLUE}   Utiliser le script Node.js pour fusionner les indices...${NC}"
        
        # Create temporary Node.js script
        cat > /tmp/merge-indexes.js << 'EOF'
const fs = require('fs');

// Read existing indexes
const existing = JSON.parse(fs.readFileSync('firestore.indexes.json', 'utf8'));
const payments = JSON.parse(fs.readFileSync('firestore-payments.indexes.json', 'utf8'));

// Merge indexes (avoid duplicates)
const mergedIndexes = [...existing.indexes];
payments.indexes.forEach(newIndex => {
  const isDuplicate = mergedIndexes.some(existingIndex => 
    JSON.stringify(existingIndex) === JSON.stringify(newIndex)
  );
  if (!isDuplicate) {
    mergedIndexes.push(newIndex);
  }
});

// Merge field overrides
const mergedOverrides = [...existing.fieldOverrides || []];
payments.fieldOverrides.forEach(newOverride => {
  const isDuplicate = mergedOverrides.some(existingOverride => 
    existingOverride.collectionGroup === newOverride.collectionGroup &&
    existingOverride.fieldPath === newOverride.fieldPath
  );
  if (!isDuplicate) {
    mergedOverrides.push(newOverride);
  }
});

// Write merged
const merged = {
  indexes: mergedIndexes,
  fieldOverrides: mergedOverrides
};

fs.writeFileSync('firestore.indexes.json', JSON.stringify(merged, null, 2));

console.log(`✅ Merged ${payments.indexes.length} indexes and ${payments.fieldOverrides.length} field overrides`);
EOF

        node /tmp/merge-indexes.js
        rm /tmp/merge-indexes.js
        
        echo -e "${GREEN}✅ Indices fusionnés${NC}"
    else
        echo -e "${BLUE}[DRY RUN] Fusionnerait firestore-payments.indexes.json dans firestore.indexes.json${NC}"
    fi
else
    echo -e "${BLUE}[4/5] Skipping indexes (--rules-only)${NC}"
fi

echo ""

###############################################################################
# 5. Déploiement Firebase
###############################################################################

echo -e "${YELLOW}[5/5] Déploiement Firebase...${NC}"

if [ "$DRY_RUN" = false ]; then
    if [ "$INDEXES_ONLY" = false ]; then
        echo -e "${BLUE}   Déploiement des règles Firestore...${NC}"
        firebase deploy --only firestore:rules
        echo -e "${GREEN}✅ Règles déployées${NC}"
    fi
    
    if [ "$RULES_ONLY" = false ]; then
        echo -e "${BLUE}   Déploiement des indices Firestore...${NC}"
        firebase deploy --only firestore:indexes
        echo -e "${GREEN}✅ Indices déployés (création peut prendre 5-10 minutes)${NC}"
    fi
else
    echo -e "${BLUE}[DRY RUN] Exécuterait:${NC}"
    if [ "$INDEXES_ONLY" = false ]; then
        echo -e "${BLUE}   firebase deploy --only firestore:rules${NC}"
    fi
    if [ "$RULES_ONLY" = false ]; then
        echo -e "${BLUE}   firebase deploy --only firestore:indexes${NC}"
    fi
fi

echo ""

###############################################################################
# Summary
###############################################################################

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ Déploiement terminé                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DRY_RUN" = false ]; then
    echo -e "${BLUE}📁 Backup sauvegardé dans:${NC} $BACKUP_DIR/"
    echo ""
    echo -e "${YELLOW}⚠️  VÉRIFICATIONS POST-DÉPLOIEMENT:${NC}"
    echo -e "   1. Ouvrir ${BLUE}https://console.firebase.google.com${NC}"
    echo -e "   2. Aller dans Firestore → Règles"
    echo -e "   3. Vérifier que les nouvelles règles sont actives"
    echo -e "   4. Aller dans Firestore → Indices"
    echo -e "   5. Vérifier que les indices se créent (statut: 'Building')"
    echo -e "   6. Attendre 5-10 minutes pour la création des indices"
    echo ""
    echo -e "${YELLOW}🧪 TESTS DE SÉCURITÉ:${NC}"
    echo -e "   Exécuter: ${BLUE}npm run test:firestore-rules${NC}"
    echo ""
    echo -e "${GREEN}✨ Collections prêtes:${NC}"
    echo -e "   • transactions"
    echo -e "   • payouts"
    echo -e "   • wallets"
    echo -e "   • bankAccounts"
    echo -e "   • withdrawals"
    echo -e "   • transfers"
    echo -e "   • bankStatements"
    echo -e "   • bankStatementEntries"
    echo -e "   • reconciliations"
    echo -e "   • commissionRules"
    echo -e "   • paymentAnalytics"
else
    echo -e "${BLUE}Mode DRY RUN - Aucune modification effectuée${NC}"
    echo -e "Relancer sans --dry-run pour déployer réellement"
fi

echo ""
