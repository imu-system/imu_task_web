/**
 * Utilitaire de chiffrement pour données sensibles (IBAN, etc.)
 * Utilise Web Crypto API (navigateur)
 * 
 * ⚠️ IMPORTANT: Ne JAMAIS stocker les clés de chiffrement dans le code
 * Les clés doivent être dérivées du mot de passe utilisateur ou stockées en sécurité
 */

/**
 * Génère une clé de chiffrement dérivée du mot de passe utilisateur
 * @param password - Mot de passe utilisateur
 * @param salt - Salt unique (stocker dans Firestore users/{userId})
 */
export async function deriveKey(password: string, salt: Uint8Array | number[]): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Convert salt to Uint8Array if it's an array
    const saltBuffer = salt instanceof Uint8Array ? salt : new Uint8Array(salt);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    // Derive encryption key
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: saltBuffer.buffer as ArrayBuffer,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Génère un salt aléatoire
 */
export function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Chiffre une chaîne de caractères (ex: IBAN)
 * @param plaintext - Texte en clair (ex: "FR7612345678901234567890123")
 * @param key - Clé de chiffrement (dérivée du mot de passe)
 * @returns Texte chiffré en base64 avec IV concaténé
 */
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );

    // Concatenate IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
}

/**
 * Déchiffre une chaîne de caractères
 * @param ciphertext - Texte chiffré en base64
 * @param key - Clé de chiffrement (même que pour encrypt)
 * @returns Texte en clair
 */
export async function decrypt(ciphertext: string, key: CryptoKey): Promise<string> {
    // Decode base64
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
    );

    // Convert to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

/**
 * Masque un IBAN pour affichage
 * @param iban - IBAN complet
 * @returns IBAN masqué (ex: "FR**************1234")
 */
export function maskIban(iban: string): string {
    if (!iban || iban.length < 8) return '****';

    const countryCode = iban.slice(0, 2);
    const last4 = iban.slice(-4);
    const masked = '*'.repeat(iban.length - 6);

    return `${countryCode}${masked}${last4}`;
}

/**
 * Valide le format d'un IBAN (basique)
 * @param iban - IBAN à valider
 */
export function validateIban(iban: string): boolean {
    // Remove spaces and convert to uppercase
    const cleaned = iban.replace(/\s/g, '').toUpperCase();

    // Check length (15-34 characters)
    if (cleaned.length < 15 || cleaned.length > 34) return false;

    // Check format: 2 letters + 2 digits + alphanumeric
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
    if (!ibanRegex.test(cleaned)) return false;

    // TODO: Implement full IBAN checksum validation if needed
    return true;
}

/**
 * Exemple d'utilisation:
 * 
 * // 1. Au signup/login, générer salt et dériver clé
 * const salt = generateSalt();
 * const key = await deriveKey(userPassword, salt);
 * 
 * // Stocker le salt dans Firestore (public, pas secret)
 * await updateDoc(doc(db, 'users', userId), { encryptionSalt: Array.from(salt) });
 * 
 * // 2. Lors de l'ajout d'un IBAN
 * const iban = "FR7612345678901234567890123";
 * if (!validateIban(iban)) throw new Error('Invalid IBAN');
 * 
 * const encryptedIban = await encrypt(iban, key);
 * const maskedIban = maskIban(iban);
 * const last4 = iban.slice(-4);
 * 
 * await addDoc(collection(db, 'bankAccounts'), {
 *   userId,
 *   iban: encryptedIban,        // Chiffré
 *   maskedIban,                  // Pour affichage
 *   last4,                       // Pour recherche
 *   // ...
 * });
 * 
 * // 3. Lors de la récupération
 * const accountDoc = await getDoc(doc(db, 'bankAccounts', accountId));
 * const decryptedIban = await decrypt(accountDoc.data().iban, key);
 */

/**
 * ⚠️ NOTES DE SÉCURITÉ:
 * 
 * 1. La clé de chiffrement NE DOIT JAMAIS être stockée en clair
 * 2. Toujours dériver la clé du mot de passe utilisateur
 * 3. Le salt peut être stocké en Firestore (il n'est pas secret)
 * 4. Ne jamais logger ou afficher les IBANs en clair
 * 5. Utiliser HTTPS obligatoire pour toutes les requêtes
 * 6. Activer Firestore Security Rules pour protéger les données
 * 
 * Alternative: Utiliser Stripe pour stocker les IBANs (recommandé)
 * - Stripe chiffre automatiquement les données bancaires
 * - Pas besoin de gérer le chiffrement côté client
 * - Conformité PCI DSS garantie
 */
