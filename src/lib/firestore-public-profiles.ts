/**
 * Service Firestore pour les Profils Publics
 * 
 * Gère la création, lecture, mise à jour et suppression des profils publics.
 * Inclut la génération de slugs, analytics et gestion du portfolio.
 */

import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp,
    increment,
    Timestamp,
    DocumentSnapshot,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import {
    PublicProfile,
    CreatePublicProfileData,
    UpdatePublicProfileData,
    SearchProfilesOptions,
    ProfileSearchResult,
    PortfolioItem,
    ProfileAnalyticsEvent,
    ProfileStats,
    ProfileVisibility,
    QualityBadge,
} from '@/types/public-profile';
import { AccountType } from './types';

const COLLECTION_NAME = 'public_profiles';
const ANALYTICS_COLLECTION = 'profile_analytics_events';

/**
 * Génère un slug unique à partir du nom d'affichage
 */
export function generateSlug(displayName: string, userId?: string): string {
    // Nettoyer et normaliser le nom
    let slug = displayName
        .toLowerCase()
        .normalize('NFD')                    // Décomposer les accents
        .replace(/[\u0300-\u036f]/g, '')     // Retirer les accents
        .replace(/[^a-z0-9\s-]/g, '')        // Garder uniquement alphanumériques, espaces et tirets
        .replace(/\s+/g, '-')                // Remplacer espaces par tirets
        .replace(/-+/g, '-')                 // Fusionner tirets multiples
        .replace(/^-|-$/g, '');              // Retirer tirets début/fin

    // Ajouter un identifiant unique si nécessaire
    if (userId) {
        const shortId = userId.slice(-6);
        slug = `${slug}-${shortId}`;
    }

    return slug;
}

/**
 * Vérifie si un slug est disponible
 */
export async function isSlugAvailable(slug: string, excludeUserId?: string): Promise<boolean> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('slug', '==', slug)
        );

        const snapshot = await getDocs(q);

        // Si aucun document trouvé, slug disponible
        if (snapshot.empty) return true;

        // Si un seul document et c'est le profil de l'utilisateur actuel, slug disponible
        if (excludeUserId && snapshot.size === 1) {
            const doc = snapshot.docs[0];
            return doc.data().userId === excludeUserId;
        }

        return false;
    } catch (error) {
        console.error('Error checking slug availability:', error);
        return false;
    }
}

/**
 * Génère un slug unique en ajoutant un numéro si nécessaire
 */
export async function generateUniqueSlug(
    displayName: string,
    userId: string
): Promise<string> {
    let baseSlug = generateSlug(displayName, userId);
    let slug = baseSlug;
    let counter = 1;

    while (!(await isSlugAvailable(slug, userId))) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

/**
 * Créer un profil public
 */
export async function createPublicProfile(
    data: CreatePublicProfileData
): Promise<PublicProfile> {
    try {
        const { userId, displayName, slug: providedSlug, accountType, categories = [], bio, headline } = data;

        // Vérifier si un profil existe déjà
        const existingProfile = await getPublicProfileByUserId(userId);
        if (existingProfile) {
            throw new Error('Un profil public existe déjà pour cet utilisateur');
        }

        // Générer un slug unique
        const slug = providedSlug
            ? (await isSlugAvailable(providedSlug, userId) ? providedSlug : await generateUniqueSlug(displayName, userId))
            : await generateUniqueSlug(displayName, userId);

        const now = Timestamp.now();

        const profileData: PublicProfile = {
            id: userId,
            userId,
            slug,
            visibility: ProfileVisibility.PRIVATE, // Par défaut privé jusqu'à publication
            isActive: false,

            displayName,
            headline,
            bio,

            accountType,
            isPro: accountType === AccountType.professional,

            categories,
            skills: [],
            languages: [],

            portfolio: [],
            maxPortfolioItems: 10, // Limite par défaut

            reviewsCount: 0,
            averageRating: 0,
            completedMissions: 0,

            badges: [],

            stats: {
                totalViews: 0,
                viewsThisMonth: 0,
                uniqueVisitors: 0,
                ctaClicks: 0,
                shareCount: 0,
            },

            isPremium: false,

            createdAt: now,
            updatedAt: now,
        };

        // Créer le document
        await setDoc(doc(db, COLLECTION_NAME, userId), profileData);

        console.log('✅ Profil public créé:', slug);
        return profileData;
    } catch (error) {
        console.error('❌ Erreur création profil public:', error);
        throw error;
    }
}

/**
 * Récupérer un profil public par slug
 */
export async function getPublicProfileBySlug(slug: string): Promise<PublicProfile | null> {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('slug', '==', slug),
            where('visibility', '!=', ProfileVisibility.PRIVATE),
            limit(1)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return { ...doc.data(), id: doc.id } as PublicProfile;
    } catch (error) {
        console.error('Error fetching profile by slug:', error);
        return null;
    }
}

/**
 * Récupérer un profil public par userId
 */
export async function getPublicProfileByUserId(userId: string): Promise<PublicProfile | null> {
    try {
        const docRef = doc(db, COLLECTION_NAME, userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return null;

        return { ...docSnap.data(), id: docSnap.id } as PublicProfile;
    } catch (error) {
        console.error('Error fetching profile by userId:', error);
        return null;
    }
}

/**
 * Mettre à jour un profil public
 */
export async function updatePublicProfile(
    userId: string,
    data: UpdatePublicProfileData
): Promise<void> {
    try {
        const docRef = doc(db, COLLECTION_NAME, userId);

        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Profil public mis à jour');
    } catch (error) {
        console.error('❌ Erreur mise à jour profil public:', error);
        throw error;
    }
}

/**
 * Publier un profil (le rendre public)
 */
export async function publishProfile(userId: string): Promise<void> {
    try {
        await updateDoc(doc(db, COLLECTION_NAME, userId), {
            visibility: ProfileVisibility.PUBLIC,
            isActive: true,
            lastPublishedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Profil publié');
    } catch (error) {
        console.error('❌ Erreur publication profil:', error);
        throw error;
    }
}

/**
 * Dépublier un profil
 */
export async function unpublishProfile(userId: string): Promise<void> {
    try {
        await updateDoc(doc(db, COLLECTION_NAME, userId), {
            visibility: ProfileVisibility.PRIVATE,
            isActive: false,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Profil dépublié');
    } catch (error) {
        console.error('❌ Erreur dépublication profil:', error);
        throw error;
    }
}

/**
 * Supprimer un profil public
 */
export async function deletePublicProfile(userId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, userId));
        console.log('✅ Profil public supprimé');
    } catch (error) {
        console.error('❌ Erreur suppression profil public:', error);
        throw error;
    }
}

/**
 * Ajouter un item au portfolio
 */
export async function addPortfolioItem(
    userId: string,
    item: Omit<PortfolioItem, 'id' | 'createdAt'>
): Promise<string> {
    try {
        const profile = await getPublicProfileByUserId(userId);
        if (!profile) throw new Error('Profil non trouvé');

        // Vérifier la limite
        if (profile.portfolio.length >= (profile.maxPortfolioItems || 10)) {
            throw new Error('Limite de portfolio atteinte');
        }

        const itemId = `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newItem: PortfolioItem = {
            ...item,
            id: itemId,
            createdAt: Timestamp.now(),
            order: profile.portfolio.length,
        };

        const updatedPortfolio = [...profile.portfolio, newItem];

        await updateDoc(doc(db, COLLECTION_NAME, userId), {
            portfolio: updatedPortfolio,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Item portfolio ajouté');
        return itemId;
    } catch (error) {
        console.error('❌ Erreur ajout portfolio:', error);
        throw error;
    }
}

/**
 * Mettre à jour un item du portfolio
 */
export async function updatePortfolioItem(
    userId: string,
    itemId: string,
    updates: Partial<Omit<PortfolioItem, 'id' | 'createdAt'>>
): Promise<void> {
    try {
        const profile = await getPublicProfileByUserId(userId);
        if (!profile) throw new Error('Profil non trouvé');

        const updatedPortfolio = profile.portfolio.map(item =>
            item.id === itemId ? { ...item, ...updates } : item
        );

        await updateDoc(doc(db, COLLECTION_NAME, userId), {
            portfolio: updatedPortfolio,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Item portfolio mis à jour');
    } catch (error) {
        console.error('❌ Erreur mise à jour portfolio:', error);
        throw error;
    }
}

/**
 * Supprimer un item du portfolio
 */
export async function deletePortfolioItem(userId: string, itemId: string): Promise<void> {
    try {
        const profile = await getPublicProfileByUserId(userId);
        if (!profile) throw new Error('Profil non trouvé');

        const updatedPortfolio = profile.portfolio.filter(item => item.id !== itemId);

        await updateDoc(doc(db, COLLECTION_NAME, userId), {
            portfolio: updatedPortfolio,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Item portfolio supprimé');
    } catch (error) {
        console.error('❌ Erreur suppression portfolio:', error);
        throw error;
    }
}

/**
 * Réorganiser le portfolio
 */
export async function reorderPortfolio(
    userId: string,
    itemIds: string[]
): Promise<void> {
    try {
        const profile = await getPublicProfileByUserId(userId);
        if (!profile) throw new Error('Profil non trouvé');

        // Créer une map pour un accès rapide
        const itemsMap = new Map(profile.portfolio.map(item => [item.id, item]));

        // Réorganiser selon l'ordre fourni
        const reorderedPortfolio = itemIds
            .map((id, index) => {
                const item = itemsMap.get(id);
                return item ? { ...item, order: index } : null;
            })
            .filter((item): item is (PortfolioItem & { order: number }) => item !== null);

        await updateDoc(doc(db, COLLECTION_NAME, userId), {
            portfolio: reorderedPortfolio,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Portfolio réorganisé');
    } catch (error) {
        console.error('❌ Erreur réorganisation portfolio:', error);
        throw error;
    }
}

/**
 * Enregistrer une vue de profil (pour analytics)
 */
export async function trackProfileView(
    profileId: string,
    metadata?: {
        source?: string;
        referrer?: string;
        device?: string;
    }
): Promise<void> {
    try {
        // Incrémenter les compteurs
        await updateDoc(doc(db, COLLECTION_NAME, profileId), {
            'stats.totalViews': increment(1),
            'stats.viewsThisMonth': increment(1),
            'stats.uniqueVisitors': increment(1),
            'stats.lastViewedAt': serverTimestamp(),
        });

        // Enregistrer l'événement détaillé
        const event: ProfileAnalyticsEvent = {
            profileId,
            eventType: 'view',
            metadata,
            timestamp: Timestamp.now(),
        };

        await setDoc(doc(collection(db, ANALYTICS_COLLECTION)), event);
    } catch (error) {
        console.error('Error tracking profile view:', error);
        // Ne pas faire échouer si l'analytics échoue
    }
}

/**
 * Enregistrer un clic sur CTA
 */
export async function trackCTAClick(profileId: string): Promise<void> {
    try {
        await updateDoc(doc(db, COLLECTION_NAME, profileId), {
            'stats.ctaClicks': increment(1),
        });

        const event: ProfileAnalyticsEvent = {
            profileId,
            eventType: 'cta_click',
            timestamp: Timestamp.now(),
        };

        await setDoc(doc(collection(db, ANALYTICS_COLLECTION)), event);
    } catch (error) {
        console.error('Error tracking CTA click:', error);
    }
}

/**
 * Enregistrer un partage
 */
export async function trackProfileShare(
    profileId: string,
    platform: string
): Promise<void> {
    try {
        await updateDoc(doc(db, COLLECTION_NAME, profileId), {
            'stats.shareCount': increment(1),
        });

        const event: ProfileAnalyticsEvent = {
            profileId,
            eventType: 'share',
            metadata: { source: platform },
            timestamp: Timestamp.now(),
        };

        await setDoc(doc(collection(db, ANALYTICS_COLLECTION)), event);
    } catch (error) {
        console.error('Error tracking share:', error);
    }
}

/**
 * Rechercher des profils publics
 */
export async function searchPublicProfiles(
    options: SearchProfilesOptions = {}
): Promise<ProfileSearchResult[]> {
    try {
        const {
            categories,
            city,
            minRating,
            isPro,
            limit: resultLimit = 20,
            sortBy = 'relevance',
        } = options;

        const constraints: QueryConstraint[] = [
            where('visibility', '==', ProfileVisibility.PUBLIC),
            where('isActive', '==', true),
        ];

        // Filtres
        if (categories && categories.length > 0) {
            constraints.push(where('categories', 'array-contains-any', categories));
        }

        if (city) {
            constraints.push(where('location', '==', city));
        }

        if (minRating) {
            constraints.push(where('averageRating', '>=', minRating));
        }

        if (isPro !== undefined) {
            constraints.push(where('isPro', '==', isPro));
        }

        // Tri
        switch (sortBy) {
            case 'rating':
                constraints.push(orderBy('averageRating', 'desc'));
                break;
            case 'recent':
                constraints.push(orderBy('createdAt', 'desc'));
                break;
            case 'popular':
                constraints.push(orderBy('stats.totalViews', 'desc'));
                break;
            default:
                // relevance - on pourrait utiliser Algolia pour un meilleur tri
                constraints.push(orderBy('averageRating', 'desc'));
        }

        constraints.push(limit(resultLimit));

        const q = query(collection(db, COLLECTION_NAME), ...constraints);
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data() as PublicProfile;
            return {
                id: doc.id,
                userId: data.userId,
                slug: data.slug,
                displayName: data.displayName,
                headline: data.headline,
                photoUrl: data.photoUrl,
                location: data.location,
                averageRating: data.averageRating,
                reviewsCount: data.reviewsCount,
                categories: data.categories,
                badges: data.badges,
                isPro: data.isPro,
                stats: {
                    totalViews: data.stats.totalViews,
                    completedMissions: data.completedMissions,
                },
            };
        });
    } catch (error) {
        console.error('Error searching profiles:', error);
        return [];
    }
}

/**
 * Récupérer les statistiques d'un profil
 */
export async function getProfileStats(userId: string): Promise<ProfileStats | null> {
    try {
        const profile = await getPublicProfileByUserId(userId);
        return profile?.stats || null;
    } catch (error) {
        console.error('Error fetching profile stats:', error);
        return null;
    }
}

/**
 * Synchroniser les données du profil utilisateur vers le profil public
 * (À appeler quand l'utilisateur met à jour son profil principal)
 */
export async function syncUserDataToPublicProfile(userId: string): Promise<void> {
    try {
        // Récupérer les données du profil utilisateur
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return;

        const userData = userDoc.data();
        const profile = userData.profile || {};

        // Mettre à jour le profil public si il existe
        const publicProfile = await getPublicProfileByUserId(userId);
        if (!publicProfile) return;

        const updates: Partial<PublicProfile> = {
            displayName: profile.displayName || userData.displayName,
            photoUrl: profile.photoUrl,
            location: profile.city,
            skills: profile.skills,
            languages: profile.languages,
            averageRating: profile.averageRating || 0,
            reviewsCount: profile.reviewsCount || 0,
        };

        await updateDoc(doc(db, COLLECTION_NAME, userId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });

        console.log('✅ Profil public synchronisé');
    } catch (error) {
        console.error('❌ Erreur synchronisation profil:', error);
    }
}

/**
 * Récupérer les analytics d'un profil
 */
export async function getProfileAnalytics(profileId: string): Promise<any | null> {
    try {
        // Pour l'instant, on retourne null car la collection analytics n'est pas encore implémentée
        // Dans une future version, on récupérera les événements de profile_analytics_events
        // et on les agrégera pour créer des statistiques détaillées

        console.log('📊 Analytics pour profil:', profileId);

        // Placeholder pour les analytics avancés
        return {
            topSources: [],
            deviceBreakdown: {},
            viewsByDay: [],
            conversionFunnel: {},
        };
    } catch (error) {
        console.error('❌ Erreur récupération analytics:', error);
        return null;
    }
}
