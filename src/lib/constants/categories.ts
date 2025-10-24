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
    },
    {
        id: 'home_services',
        slug: 'services-maison',
        nameKey: 'homeServices',
        icon: Home,
        color: '#6366F1', // indigo
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
