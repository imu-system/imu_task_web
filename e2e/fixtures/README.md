# Test Fixtures

Ce dossier contient des fichiers de test pour les tests E2E.

## Fichiers disponibles

### Documents KYC valides (PDF)
- `test-identity.pdf` - Document d'identité de test
- `test-address.pdf` - Justificatif de domicile de test
- `test-professional.pdf` - Document professionnel de test
- `test-tax.pdf` - Document fiscal de test

### Images valides (PNG)
- `test-identity.png` - Image d'identité
- `test-address.png` - Image de justificatif
- `test-avatar.png` - Image d'avatar

### Fichiers invalides (pour tests de validation)
- `invalid-file.txt` - Fichier texte (type non autorisé)
- `too-large.pdf` - Fichier de 11MB (dépasse la limite de 10MB)

## Utilisation

Ces fichiers sont utilisés dans les tests E2E Playwright:
- `/e2e/kyc-flow.spec.ts`
- `/e2e/auth-flow.spec.ts`

## Régénération

Pour régénérer tous les fixtures:
```bash
node scripts/generate-fixtures.js
```

## Notes

- Les PDFs sont des fichiers minimaux valides générés programmatiquement
- Les PNGs sont des images 1x1 pixel transparentes
- Ces fichiers sont uniquement pour les tests, ne les utilisez pas en production
