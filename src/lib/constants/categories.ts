import {
    Sparkles,
    Truck,
    Spade,
    Package,
    Wrench,
    PawPrint,
    GraduationCap,
    Home,
    MoreHorizontal,
} from 'lucide-react';

export interface TaskCategory {
    id: string;
    slug: string;
    nameKey: string;
    icon: React.ComponentType<{ className?: string }>;
    color?: string;
    isAccessible?: boolean; // Adapté aux personnes à mobilité réduite (PMR)
}

/**
 * Unified list of task categories for ImuTask
 * Used across CategoryPills, HeroSearchBar, and task filtering
 */
export const TASK_CATEGORIES: readonly TaskCategory[] = [
    {
        id: 'cleaning',
        slug: 'menage',
        nameKey: 'cleaning',
        icon: Sparkles,
        color: '#3B82F6', // blue
        isAccessible: true, // PMR-friendly
    },
    {
        id: 'moving',
        slug: 'demenagement',
        nameKey: 'moving',
        icon: Truck,
        color: '#14B8A6', // teal
    },
    {
        id: 'gardening',
        slug: 'jardinage',
        nameKey: 'gardening',
        icon: Spade,
        color: '#22C55E', // lime/green
    },
    {
        id: 'delivery',
        slug: 'livraison',
        nameKey: 'delivery',
        icon: Package,
        color: '#F59E0B', // amber
        isAccessible: true, // PMR-friendly
    },
    {
        id: 'handyman',
        slug: 'bricolage',
        nameKey: 'handyman',
        icon: Wrench,
        color: '#8B5CF6', // violet
    },
    {
        id: 'pet_care',
        slug: 'garde-animaux',
        nameKey: 'petCare',
        icon: PawPrint,
        color: '#EC4899', // pink
    },
    {
        id: 'tutoring',
        slug: 'cours-particuliers',
        nameKey: 'tutoring',
        icon: GraduationCap,
        color: '#10B981', // emerald
        isAccessible: true, // PMR-friendly
    },
    {
        id: 'home_services',
        slug: 'services-maison',
        nameKey: 'homeServices',
        icon: Home,
        color: '#6366F1', // indigo
        isAccessible: true, // PMR-friendly
    },
    {
        id: 'other',
        slug: 'autres',
        nameKey: 'other',
        icon: MoreHorizontal,
        color: '#6B7280', // gray
    },
] as const;

/**
 * Get category by ID
 */
export function getCategoryById(id: string): TaskCategory | undefined {
    return TASK_CATEGORIES.find((cat) => cat.id === id);
}

/**
 * Get category by slug
 */
export function getCategoryBySlug(slug: string): TaskCategory | undefined {
    return TASK_CATEGORIES.find((cat) => cat.slug === slug);
}

/**
 * Get category IDs as array (for Select components)
 */
export const CATEGORY_IDS = TASK_CATEGORIES.map((cat) => cat.id);

/**
 * Get category slugs as array
 */
export const CATEGORY_SLUGS = TASK_CATEGORIES.map((cat) => cat.slug);

/**
 * Mapping between frontend slugs and Firestore category values
 * This is needed because the seed script uses different category names
 * Note: 'autres' is a special case - it will show all tasks that don't match other categories
 */
export const SLUG_TO_FIRESTORE_CATEGORY: Record<string, string> = {
    'menage': 'aide_domicile',
    'demenagement': 'demenagement',
    'jardinage': 'jardinage',
    'livraison': 'courses_livraisons',
    'bricolage': 'aide_domicile',
    'garde-animaux': 'animaux',
    'cours-particuliers': 'accompagnement',
    'services-maison': 'aide_domicile',
    'autres': 'OTHER_CATEGORIES' // Special marker for filtering
};

/**
 * Get all Firestore categories (for "autres" exclusion filter)
 */
export const FIRESTORE_CATEGORIES = [
    'aide_domicile',
    'courses_livraisons',
    'aide_numerique',
    'demenagement',
    'accompagnement',
    'jardinage',
    'animaux',
    'evenements'
] as const;

/**
 * Convert frontend slug to Firestore category value
 */
export function slugToFirestoreCategory(slug: string): string {
    return SLUG_TO_FIRESTORE_CATEGORY[slug] || slug;
}

/**
 * Convert Firestore category value to frontend slug
 * Used for finding the right icon/color in TASK_CATEGORIES
 */
export function firestoreCategoryToSlug(firestoreCategory: string): string {
    // Find the slug that maps to this Firestore category
    const entry = Object.entries(SLUG_TO_FIRESTORE_CATEGORY).find(
        ([_, value]) => value === firestoreCategory
    );
    return entry ? entry[0] : firestoreCategory;
}

/**
 * Get category data by Firestore category value
 */
export function getCategoryByFirestoreValue(firestoreCategory: string): TaskCategory | undefined {
    const slug = firestoreCategoryToSlug(firestoreCategory);
    return TASK_CATEGORIES.find(cat => cat.slug === slug || cat.id === slug);
}
