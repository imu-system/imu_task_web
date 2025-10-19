#!/usr/bin/env node

/**
 * Generate Test Fixtures
 * Crée des fichiers PDF et images de test pour les tests E2E
 */

const fs = require('fs');
const path = require('path');

const fixturesDir = path.join(__dirname, '../e2e/fixtures');

// Créer le dossier fixtures s'il n'existe pas
if (!fs.existsSync(fixturesDir)) {
  fs.mkdirSync(fixturesDir, { recursive: true });
}

console.log('📁 Création des fixtures de test...\n');

// Générer un PDF minimal valide
function generateMinimalPDF(filename, content = 'Test Document') {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 24 Tf
100 700 Td
(${content}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF`;

  const filePath = path.join(fixturesDir, filename);
  fs.writeFileSync(filePath, pdfContent);
  console.log(`✅ Créé: ${filename} (PDF)`);
}

// Générer une image PNG minimale (1x1 pixel transparent)
function generateMinimalPNG(filename) {
  // PNG 1x1 transparent en base64
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const pngBuffer = Buffer.from(pngBase64, 'base64');
  
  const filePath = path.join(fixturesDir, filename);
  fs.writeFileSync(filePath, pngBuffer);
  console.log(`✅ Créé: ${filename} (PNG)`);
}

// Générer un fichier texte (pour tester la validation)
function generateTextFile(filename) {
  const content = 'This is a text file used to test file type validation. It should be rejected.';
  const filePath = path.join(fixturesDir, filename);
  fs.writeFileSync(filePath, content);
  console.log(`✅ Créé: ${filename} (TXT - pour tests de validation)`);
}

// Générer tous les fixtures
console.log('🔧 Génération des documents KYC...');
generateMinimalPDF('test-identity.pdf', 'Identity Document Test');
generateMinimalPDF('test-address.pdf', 'Address Proof Test');
generateMinimalPDF('test-professional.pdf', 'Professional Document Test');
generateMinimalPDF('test-tax.pdf', 'Tax Document Test');

console.log('\n🔧 Génération des images...');
generateMinimalPNG('test-identity.png');
generateMinimalPNG('test-address.png');
generateMinimalPNG('test-avatar.png');

console.log('\n🔧 Génération des fichiers invalides...');
generateTextFile('invalid-file.txt');

// Générer un fichier trop gros (pour tester la limite de 10MB)
console.log('\n🔧 Génération d\'un fichier trop gros...');
const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'A'); // 11MB
const largeFilePath = path.join(fixturesDir, 'too-large.pdf');
fs.writeFileSync(largeFilePath, largeBuffer);
console.log(`✅ Créé: too-large.pdf (11MB - pour test de taille)`);

// Créer un fichier README dans fixtures
const readmeContent = `# Test Fixtures

Ce dossier contient des fichiers de test pour les tests E2E.

## Fichiers disponibles

### Documents KYC valides (PDF)
- \`test-identity.pdf\` - Document d'identité de test
- \`test-address.pdf\` - Justificatif de domicile de test
- \`test-professional.pdf\` - Document professionnel de test
- \`test-tax.pdf\` - Document fiscal de test

### Images valides (PNG)
- \`test-identity.png\` - Image d'identité
- \`test-address.png\` - Image de justificatif
- \`test-avatar.png\` - Image d'avatar

### Fichiers invalides (pour tests de validation)
- \`invalid-file.txt\` - Fichier texte (type non autorisé)
- \`too-large.pdf\` - Fichier de 11MB (dépasse la limite de 10MB)

## Utilisation

Ces fichiers sont utilisés dans les tests E2E Playwright:
- \`/e2e/kyc-flow.spec.ts\`
- \`/e2e/auth-flow.spec.ts\`

## Régénération

Pour régénérer tous les fixtures:
\`\`\`bash
node scripts/generate-fixtures.js
\`\`\`

## Notes

- Les PDFs sont des fichiers minimaux valides générés programmatiquement
- Les PNGs sont des images 1x1 pixel transparentes
- Ces fichiers sont uniquement pour les tests, ne les utilisez pas en production
`;

fs.writeFileSync(path.join(fixturesDir, 'README.md'), readmeContent);
console.log(`\n✅ Créé: README.md (documentation)\n`);

console.log('✨ Tous les fixtures ont été générés avec succès!\n');
console.log('📍 Emplacement:', fixturesDir);
console.log('\n📝 Pour exécuter les tests E2E:');
console.log('   npx playwright test e2e/kyc-flow.spec.ts');
console.log('   npx playwright test e2e/auth-flow.spec.ts\n');
