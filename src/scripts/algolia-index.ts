/**
 * Script d'indexation Algolia
 * 
 * Synchronise les données Firestore → Algolia
 * 
 * Usage:
 * - Dev: npm run algolia:index
 * - Prod: Déclencheur Cloud Function sur Firestore write
 * 
 * Indices créés:
 * - tasks: Tâches/missions avec géolocalisation
 * - users: Prestataires/professionnels avec skills
 * - services: Services/catégories avec popularité
 */

import * as admin from 'firebase-admin';
import { indicesConfig, ALGOLIA_INDICES } from '../lib/algolia-config';

// Initialiser Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Client Algolia Admin (server-side only)
const algoliasearch = require('algoliasearch');
const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
const ALGOLIA_ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY || '';

if (!ALGOLIA_APP_ID || !ALGOLIA_ADMIN_API_KEY) {
    console.error('❌ Variables d\'environnement Algolia manquantes:');
    console.error('   NEXT_PUBLIC_ALGOLIA_APP_ID:', ALGOLIA_APP_ID ? '✅' : '❌');
    console.error('   ALGOLIA_ADMIN_API_KEY:', ALGOLIA_ADMIN_API_KEY ? '✅' : '❌');
    process.exit(1);
}

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_API_KEY);

/**
 * Configurer un index Algolia
 */
async function configureIndex(indexName: keyof typeof indicesConfig) {
    const index = client.initIndex(ALGOLIA_INDICES[indexName]);
    const config = indicesConfig[indexName];

    console.log(`📋 Configuration de l'index "${indexName}"...`);

    await index.setSettings({
        searchableAttributes: config.searchableAttributes,
        attributesForFaceting: config.attributesForFaceting,
        customRanking: config.customRanking,
        attributesToHighlight: config.attributesToHighlight,
        attributesToRetrieve: config.attributesToRetrieve,
        typoTolerance: config.typoTolerance,
        minWordSizefor1Typo: config.minWordSizefor1Typo,
        minWordSizefor2Typos: config.minWordSizefor2Typos,
    });

    console.log(`✅ Index "${indexName}" configuré`);
}

/**
 * Indexer les tâches
 */
async function indexTasks() {
    console.log('\n📦 Indexation des tâches...');

    const tasksSnapshot = await db.collection('tasks').get();
    const index = client.initIndex(ALGOLIA_INDICES.tasks);

    const records = tasksSnapshot.docs.map((doc) => {
        const data = doc.data();

        // Convertir Firestore Timestamp en nombre
        const createdAt = data.createdAt?.toMillis?.() || Date.now();

        // Construire _geoloc pour geo-search
        let _geoloc;
        if (data.location?.lat && data.location?.lng) {
            _geoloc = {
                lat: data.location.lat,
                lng: data.location.lng,
            };
        }

        return {
            objectID: doc.id,
            title: data.title || '',
            description: data.description || '',
            category: data.category || '',
            budget: data.budget || 0,
            status: data.status || 'open',
            urgent: data.urgent || false,
            createdAt,
            location: {
                address: data.location?.address || '',
                city: data.location?.city || '',
                lat: data.location?.lat || null,
                lng: data.location?.lng || null,
            },
            userId: data.userId || '',
            tags: data.tags || [],
            _geoloc,
        };
    });

    if (records.length > 0) {
        await index.saveObjects(records);
        console.log(`✅ ${records.length} tâches indexées`);
    } else {
        console.log('⚠️  Aucune tâche à indexer');
    }
}

/**
 * Indexer les utilisateurs (prestataires)
 */
async function indexUsers() {
    console.log('\n👥 Indexation des utilisateurs...');

    const usersSnapshot = await db.collection('users').get();
    const index = client.initIndex(ALGOLIA_INDICES.users);

    const records = usersSnapshot.docs
        .filter((doc) => {
            const data = doc.data();
            // Indexer seulement les professionnels ou comptes avec profil complet
            return data.accountType === 'professional' || data.profile?.displayName;
        })
        .map((doc) => {
            const data = doc.data();

            // Construire _geoloc pour geo-search
            let _geoloc;
            if (data.profile?.location?.lat && data.profile?.location?.lng) {
                _geoloc = {
                    lat: data.profile.location.lat,
                    lng: data.profile.location.lng,
                };
            }

            return {
                objectID: doc.id,
                email: data.email || '',
                accountType: data.accountType || 'individual',
                profile: {
                    displayName: data.profile?.displayName || '',
                    companyName: data.profile?.companyName || '',
                    photoUrl: data.profile?.photoUrl || '',
                    bio: data.profile?.bio || '',
                    skills: data.profile?.skills || [],
                    serviceCategories: data.profile?.serviceCategories || [],
                    rating: data.profile?.rating || 0,
                    completedJobs: data.profile?.completedJobs || 0,
                    verified: data.profile?.verified || false,
                    location: {
                        city: data.profile?.location?.city || '',
                        lat: data.profile?.location?.lat || null,
                        lng: data.profile?.location?.lng || null,
                    },
                },
                _geoloc,
            };
        });

    if (records.length > 0) {
        await index.saveObjects(records);
        console.log(`✅ ${records.length} utilisateurs indexés`);
    } else {
        console.log('⚠️  Aucun utilisateur à indexer');
    }
}

/**
 * Indexer les services
 */
async function indexServices() {
    console.log('\n🛠️  Indexation des services...');

    const servicesSnapshot = await db.collection('service_packages').get();
    const index = client.initIndex(ALGOLIA_INDICES.services);

    const records = servicesSnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            objectID: doc.id,
            name: data.name || '',
            description: data.description || '',
            category: data.category || '',
            icon: data.icon || '',
            tags: data.tags || [],
            keywords: data.keywords || [],
            bookingCount: data.bookingCount || 0,
            rating: data.rating || 0,
            popular: data.popular || false,
        };
    });

    if (records.length > 0) {
        await index.saveObjects(records);
        console.log(`✅ ${records.length} services indexés`);
    } else {
        console.log('⚠️  Aucun service à indexer');
    }
}

/**
 * Script principal
 */
async function main() {
    console.log('🚀 Début de l\'indexation Algolia\n');
    console.log(`📍 App ID: ${ALGOLIA_APP_ID}`);
    console.log(`📍 Admin Key: ${ALGOLIA_ADMIN_API_KEY.substring(0, 10)}...`);

    try {
        // Configurer les indices
        await configureIndex('tasks');
        await configureIndex('users');
        await configureIndex('services');

        // Indexer les données
        await indexTasks();
        await indexUsers();
        await indexServices();

        console.log('\n✅ Indexation terminée avec succès !');
        console.log('\n📊 Vérifiez vos indices sur:');
        console.log(`   https://www.algolia.com/apps/${ALGOLIA_APP_ID}/explorer/browse`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Erreur lors de l\'indexation:', error);
        process.exit(1);
    }
}

// Exécuter le script
main();
