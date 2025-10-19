# Création du compte admin pour les tests E2E

## Méthode 1 : Via Firebase Console (Recommandé)

1. **Ouvrir Firebase Console** : https://console.firebase.google.com/project/imutask/authentication/users

2. **Ajouter un utilisateur** :
   - Cliquer sur "Add user"
   - Email: `admin@imutask.com`
   - Password: `AdminPassword123!`
   - Cliquer sur "Add user"

3. **Copier l'UID** du nouvel utilisateur (ex: `abc123def456...`)

4. **Créer le document utilisateur dans Firestore** :
   - Ouvrir : https://console.firebase.google.com/project/imutask/firestore
   - Collection: `users`
   - Document ID: `p36eo5q7WKOdfmmiUhNP`
   - Champs:
     ```json
     {
       "email": "admin@imutask.com",
       "displayName": "Admin Test",
       "roles": ["admin"],
       "createdAt": [Timestamp now],
       "updatedAt": [Timestamp now]
     }
     ```

## Méthode 2 : Via l'application

1. **S'inscrire normalement** avec `admin@imutask.com`
2. **Ajouter le rôle admin manuellement** dans Firestore :
   - Ouvrir le document utilisateur
   - Modifier le champ `roles` → `["admin"]`

## Vérification

Une fois créé, vous pouvez vous connecter à l'app avec :
- Email: `admin@imutask.com`
- Password: `AdminPassword123!`

Et accéder aux pages admin :
- http://localhost:9002/en/admin/roles
- http://localhost:9002/en/admin/kyc
