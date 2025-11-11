#!/usr/bin/env tsx
/**
 * Script de seed data pour les tests E2E
 * Peuple Firestore avec des tâches et prestataires de test
 * 
 * Usage:
 *   pnpm tsx scripts/seed-test-data.ts
 *   pnpm seed:test
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as path from 'path';

// Configuration Firebase Admin
const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');

let app;
if (getApps().length === 0) {
    try {
        const serviceAccount = require(serviceAccountPath);
        app = initializeApp({
            credential: cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialisé avec succès');
    } catch (error) {
        console.error('❌ Erreur: serviceAccountKey.json introuvable');
        console.error('   Téléchargez-le depuis Firebase Console > Project Settings > Service Accounts');
        process.exit(1);
    }
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

// Données de seed
const SEED_USER_ID = 'test-seed-user-id';
const SEED_USER_EMAIL = 'seed-test@example.com';

const CATEGORIES = [
    'aide_domicile',
    'courses_livraisons',
    'aide_numerique',
    'demenagement',
    'accompagnement',
    'jardinage',
    'animaux',
    'evenements'
] as const;

const TASK_TEMPLATES = {
    aide_domicile: [
        { title: 'Montage de meuble IKEA', description: 'Besoin d\'aide pour monter une armoire PAX', budget: 50 },
        { title: 'Petit bricolage', description: 'Installation étagères murales', budget: 30 }
    ],
    courses_livraisons: [
        { title: 'Courses hebdomadaires', description: 'Faire les courses au supermarché', budget: 25 },
        { title: 'Livraison colis', description: 'Récupérer et livrer un colis', budget: 20 }
    ],
    aide_numerique: [
        { title: 'Configuration ordinateur', description: 'Aide pour configurer un nouvel ordinateur', budget: 40 },
        { title: 'Assistance smartphone', description: 'Apprendre à utiliser mon smartphone', budget: 35 }
    ],
    demenagement: [
        { title: 'Déménagement studio', description: 'Aide pour déménager un studio', budget: 100 },
        { title: 'Transport meubles', description: 'Déplacer des meubles lourds', budget: 60 }
    ],
    accompagnement: [
        { title: 'Accompagnement médical', description: 'Accompagner à un rendez-vous médical', budget: 30 },
        { title: 'Promenade', description: 'Sortie au parc', budget: 20 }
    ],
    jardinage: [
        { title: 'Tonte pelouse', description: 'Tondre la pelouse du jardin', budget: 40 },
        { title: 'Taille haies', description: 'Tailler les haies', budget: 50 }
    ],
    animaux: [
        { title: 'Promenade chien', description: 'Promener mon chien 2x par jour', budget: 25 },
        { title: 'Garde chat', description: 'Garder mon chat pendant les vacances', budget: 15 }
    ],
    evenements: [
        { title: 'Aide déménagement', description: 'Aide pour déménagement le weekend', budget: 80 },
        { title: 'Installation fête', description: 'Installer décoration pour fête d\'anniversaire', budget: 40 }
    ]
};

const LOCATIONS = [
    { address: 'Paris 15e, France', lat: 48.8422, lng: 2.2897 },
    { address: 'Lyon 3e, France', lat: 45.7579, lng: 4.8550 },
    { address: 'Marseille 6e, France', lat: 43.2873, lng: 5.3810 },
    { address: 'Toulouse Centre, France', lat: 43.6045, lng: 1.4440 },
    { address: 'Bordeaux, France', lat: 44.8378, lng: -0.5792 }
];

const PROVIDER_PROFILES = [
    {
        displayName: 'Marie Dubois',
        bio: 'Étudiante en médecine, disponible pour aide à domicile et accompagnement',
        skills: ['aide_domicile', 'accompagnement', 'courses_livraisons'],
        rating: 4.8,
        reviewCount: 24
    },
    {
        displayName: 'Lucas Martin',
        bio: 'Étudiant ingénieur, spécialisé en aide numérique et bricolage',
        skills: ['aide_numerique', 'aide_domicile', 'demenagement'],
        rating: 4.9,
        reviewCount: 31
    },
    {
        displayName: 'Sophie Bernard',
        bio: 'Passionnée de jardinage et animaux, disponible le weekend',
        skills: ['jardinage', 'animaux', 'aide_domicile'],
        rating: 4.7,
        reviewCount: 18
    },
    {
        displayName: 'Thomas Petit',
        bio: 'Entrepreneur, aide pour événements et déménagements',
        skills: ['evenements', 'demenagement', 'courses_livraisons'],
        rating: 4.6,
        reviewCount: 15
    },
    {
        displayName: 'Emma Lefebvre',
        bio: 'Étudiante polyvalente, tous types de services',
        skills: ['aide_numerique', 'courses_livraisons', 'animaux', 'accompagnement'],
        rating: 4.9,
        reviewCount: 42
    }
];

async function seedTasks() {
    console.log('\n📝 Création des tâches de test...');

    const tasksCreated: string[] = [];
    let taskCount = 0;

    // Créer 2 tâches par catégorie (16 tâches au total)
    for (const category of CATEGORIES) {
        const templates = TASK_TEMPLATES[category];

        for (let i = 0; i < templates.length; i++) {
            const template = templates[i];
            const location = LOCATIONS[taskCount % LOCATIONS.length];

            const taskData = {
                title: template.title,
                description: template.description,
                category,
                budget: template.budget,
                status: 'open' as const,
                clientId: SEED_USER_ID,
                location: {
                    address: location.address,
                    lat: location.lat,
                    lng: location.lng
                },
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                isPublic: true,
                urgency: 'normal' as const
            };

            const taskRef = await db.collection('tasks').add(taskData);
            tasksCreated.push(taskRef.id);
            taskCount++;

            console.log(`  ✅ Tâche créée: ${template.title} (${category}) - ID: ${taskRef.id}`);
        }
    }

    console.log(`\n✅ ${taskCount} tâches créées avec succès`);
    return tasksCreated;
}

async function seedProviders() {
    console.log('\n👥 Création des profils prestataires...');

    const providersCreated: string[] = [];

    for (let i = 0; i < PROVIDER_PROFILES.length; i++) {
        const profile = PROVIDER_PROFILES[i];
        const location = LOCATIONS[i % LOCATIONS.length];

        // Créer un ID unique pour chaque prestataire
        const providerId = `seed-provider-${i + 1}`;

        const providerData = {
            uid: providerId,
            email: `provider${i + 1}@example.com`,
            displayName: profile.displayName,
            accountType: 'provider' as const,
            bio: profile.bio,
            skills: profile.skills,
            location: {
                address: location.address,
                lat: location.lat,
                lng: location.lng
            },
            rating: profile.rating,
            reviewCount: profile.reviewCount,
            isAvailable: true,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            profileComplete: true,
            kycStatus: 'approved' as const
        };

        await db.collection('users').doc(providerId).set(providerData);
        providersCreated.push(providerId);

        console.log(`  ✅ Prestataire créé: ${profile.displayName} - ID: ${providerId}`);
    }

    console.log(`\n✅ ${providersCreated.length} prestataires créés avec succès`);
    return providersCreated;
}

async function createSeedUser() {
    console.log('\n👤 Création du compte utilisateur de test...');

    const userData = {
        uid: SEED_USER_ID,
        email: SEED_USER_EMAIL,
        displayName: 'Test Seed User',
        accountType: 'client' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        profileComplete: true
    };

    await db.collection('users').doc(SEED_USER_ID).set(userData, { merge: true });
    console.log(`✅ Utilisateur créé: ${userData.displayName} (${SEED_USER_EMAIL})`);
}

async function cleanupOldSeedData() {
    console.log('\n🧹 Nettoyage des anciennes données de test...');

    // Nettoyer les anciennes tâches
    const oldTasks = await db.collection('tasks')
        .where('clientId', '==', SEED_USER_ID)
        .get();

    const batch1 = db.batch();
    oldTasks.docs.forEach(doc => batch1.delete(doc.ref));
    await batch1.commit();
    console.log(`  ✅ ${oldTasks.size} anciennes tâches supprimées`);

    // Nettoyer les anciens prestataires
    const oldProviders = await db.collection('users')
        .where('uid', '>=', 'seed-provider-')
        .where('uid', '<=', 'seed-provider-\uf8ff')
        .get();

    const batch2 = db.batch();
    oldProviders.docs.forEach(doc => batch2.delete(doc.ref));
    await batch2.commit();
    console.log(`  ✅ ${oldProviders.size} anciens prestataires supprimés`);
}

async function main() {
    try {
        console.log('🚀 Démarrage du seed des données de test E2E\n');
        console.log('='.repeat(60));

        // 1. Nettoyer les anciennes données
        await cleanupOldSeedData();

        // 2. Créer l'utilisateur de test
        await createSeedUser();

        // 3. Créer les tâches
        const tasks = await seedTasks();

        // 4. Créer les prestataires
        const providers = await seedProviders();

        console.log('\n' + '='.repeat(60));
        console.log('✅ SEED COMPLÉTÉ AVEC SUCCÈS\n');
        console.log(`📊 Résumé:`);
        console.log(`   • Utilisateur de test: 1`);
        console.log(`   • Tâches créées: ${tasks.length}`);
        console.log(`   • Prestataires créés: ${providers.length}`);
        console.log(`   • Catégories couvertes: ${CATEGORIES.length}`);
        console.log('\n💡 Vous pouvez maintenant lancer les tests E2E:');
        console.log('   pnpm test:e2e e2e/favorites.spec.ts');
        console.log('='.repeat(60));

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERREUR lors du seed:', error);
        process.exit(1);
    }
}

// Exécuter le script
main();
