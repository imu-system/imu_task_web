/**
 * Service Category Types & Enums
 * Basé sur /docs/SERVICES_CATALOG.md
 */

/**
 * Catégories de services disponibles sur ImuTask (MVP/V1)
 */
export enum ServiceCategory {
    HOME_HELP = 'home_help', // Aide à domicile
    DELIVERY = 'delivery', // Courses & Livraisons
    DIGITAL_HELP = 'digital_help', // Aide Numérique
    MOVING = 'moving', // Déménagement
    ACCOMPANIMENT = 'accompaniment', // Accompagnement
    GARDENING = 'gardening', // Jardinage
    PET_CARE = 'pet_care', // Garde d'animaux
    EVENT_HELP = 'event_help', // Aide Événementielle
}

/**
 * Tags/sous-catégories pour chaque catégorie principale
 */
export const ServiceTags = {
    [ServiceCategory.HOME_HELP]: [
        'cleaning',
        'tidying',
        'small_repairs',
        'maintenance',
        'meal_prep',
        'laundry',
    ],
    [ServiceCategory.DELIVERY]: [
        'groceries',
        'packages',
        'pharmacy',
        'documents',
        'food_delivery',
    ],
    [ServiceCategory.DIGITAL_HELP]: [
        'smartphone_setup',
        'app_training',
        'basic_admin',
        'internet_connection',
        'device_troubleshooting',
    ],
    [ServiceCategory.MOVING]: [
        'packing',
        'furniture_assembly',
        'heavy_lifting',
        'unpacking',
        'cleaning_after',
    ],
    [ServiceCategory.ACCOMPANIMENT]: [
        'medical_appointment',
        'companionship',
        'shopping_assistance',
        'administrative_help',
    ],
    [ServiceCategory.GARDENING]: [
        'lawn_mowing',
        'garden_cleaning',
        'watering',
        'hedge_trimming',
        'leaf_removal',
    ],
    [ServiceCategory.PET_CARE]: [
        'dog_walking',
        'pet_sitting',
        'feeding',
        'play_time',
    ],
    [ServiceCategory.EVENT_HELP]: [
        'setup',
        'service',
        'hosting',
        'cleanup',
    ],
} as const;

/**
 * Métadonnées de chaque catégorie
 */
export interface ServiceCategoryMetadata {
    id: ServiceCategory;
    name: string;
    description: string;
    icon: string; // Lucide icon name
    color: string; // Tailwind color class
    examples: string[];
    priceRange: {
        min: number;
        max: number;
        unit: 'hour' | 'visit' | 'task';
    };
    durationRange: {
        min: number; // minutes
        max: number; // minutes
    };
    requiredSkills: string[];
}

/**
 * Configuration complète de toutes les catégories
 */
export const SERVICE_CATEGORIES: Record<ServiceCategory, ServiceCategoryMetadata> = {
    [ServiceCategory.HOME_HELP]: {
        id: ServiceCategory.HOME_HELP,
        name: 'Aide à domicile',
        description: 'Ménage, rangement, petits travaux de bricolage, entretien de la maison, préparation de repas simples.',
        icon: 'Home',
        color: 'blue',
        examples: [
            'Faire le ménage dans un appartement',
            'Ranger un garage',
            'Petites réparations simples (changer une ampoule, fixer une étagère)',
            'Entretien courant',
            'Préparer un repas simple',
        ],
        priceRange: { min: 15, max: 25, unit: 'hour' },
        durationRange: { min: 60, max: 240 },
        requiredSkills: ['Rigueur', 'Autonomie', 'Sens du détail'],
    },
    [ServiceCategory.DELIVERY]: {
        id: ServiceCategory.DELIVERY,
        name: 'Courses & Livraisons',
        description: 'Faire les courses au supermarché, livrer des colis ou documents, aller à la pharmacie.',
        icon: 'ShoppingCart',
        color: 'green',
        examples: [
            'Faire les courses au supermarché',
            'Récupérer et livrer un colis',
            'Aller chercher des médicaments à la pharmacie',
            'Livrer un document urgent',
        ],
        priceRange: { min: 12, max: 20, unit: 'hour' },
        durationRange: { min: 30, max: 120 },
        requiredSkills: ['Ponctualité', 'Fiabilité', 'Permis de conduire (optionnel)'],
    },
    [ServiceCategory.DIGITAL_HELP]: {
        id: ServiceCategory.DIGITAL_HELP,
        name: 'Aide Numérique',
        description: 'Configuration de smartphone/tablette, formation aux applications, aide administrative en ligne simple.',
        icon: 'Smartphone',
        color: 'purple',
        examples: [
            'Configurer un nouveau smartphone',
            'Apprendre à utiliser WhatsApp, Zoom ou autres apps',
            'Aide pour des démarches administratives en ligne simples',
            'Configurer une connexion internet',
        ],
        priceRange: { min: 18, max: 30, unit: 'hour' },
        durationRange: { min: 60, max: 180 },
        requiredSkills: ['Pédagogie', 'Patience', 'Connaissances numériques de base'],
    },
    [ServiceCategory.MOVING]: {
        id: ServiceCategory.MOVING,
        name: 'Déménagement',
        description: 'Aider à emballer, porter des meubles, monter/démonter des meubles simples, manutention.',
        icon: 'Package',
        color: 'orange',
        examples: [
            'Emballer des affaires dans des cartons',
            'Porter des meubles',
            'Monter un meuble Ikea',
            'Aide ponctuelle lors d\'un déménagement',
        ],
        priceRange: { min: 15, max: 25, unit: 'hour' },
        durationRange: { min: 120, max: 480 },
        requiredSkills: ['Force physique', 'Manutention', 'Esprit d\'équipe'],
    },
    [ServiceCategory.ACCOMPANIMENT]: {
        id: ServiceCategory.ACCOMPANIMENT,
        name: 'Accompagnement',
        description: 'Accompagner à des rendez-vous médicaux, faire de la compagnie, aide ponctuelle aux personnes à mobilité réduite.',
        icon: 'Users',
        color: 'pink',
        examples: [
            'Accompagner une personne âgée à un rendez-vous médical',
            'Faire de la compagnie (discussion, jeux)',
            'Accompagner pour des courses',
            'Aide ponctuelle pour personnes à mobilité réduite',
        ],
        priceRange: { min: 15, max: 22, unit: 'hour' },
        durationRange: { min: 60, max: 240 },
        requiredSkills: ['Empathie', 'Écoute', 'Patience'],
    },
    [ServiceCategory.GARDENING]: {
        id: ServiceCategory.GARDENING,
        name: 'Jardinage',
        description: 'Tonte de pelouse, nettoyage de jardin, arrosage, entretien basique.',
        icon: 'TreePine',
        color: 'emerald',
        examples: [
            'Tondre une pelouse',
            'Nettoyer un jardin (ramassage feuilles, désherbage)',
            'Arroser les plantes',
            'Tailler une haie simple',
        ],
        priceRange: { min: 15, max: 22, unit: 'hour' },
        durationRange: { min: 60, max: 240 },
        requiredSkills: ['Connaissance jardinage de base', 'Bricolage', 'Autonomie'],
    },
    [ServiceCategory.PET_CARE]: {
        id: ServiceCategory.PET_CARE,
        name: 'Garde d\'animaux',
        description: 'Promener un chien, garde à domicile (chats, petits animaux), nourrir les animaux.',
        icon: 'Dog',
        color: 'amber',
        examples: [
            'Promener un chien',
            'Garder un chat à domicile',
            'Nourrir et s\'occuper d\'animaux pendant une absence',
            'Jouer avec un animal',
        ],
        priceRange: { min: 12, max: 20, unit: 'visit' },
        durationRange: { min: 30, max: 120 },
        requiredSkills: ['Amour des animaux', 'Responsabilité', 'Douceur'],
    },
    [ServiceCategory.EVENT_HELP]: {
        id: ServiceCategory.EVENT_HELP,
        name: 'Aide Événementielle',
        description: 'Installation/démontage d\'événements, service lors de réceptions, accueil invités.',
        icon: 'PartyPopper',
        color: 'red',
        examples: [
            'Installer des tables et chaises pour un événement',
            'Servir lors d\'une réception',
            'Accueillir les invités',
            'Nettoyer après un événement',
        ],
        priceRange: { min: 15, max: 25, unit: 'hour' },
        durationRange: { min: 120, max: 360 },
        requiredSkills: ['Dynamisme', 'Présentation soignée', 'Esprit d\'équipe'],
    },
};

/**
 * Templates de tâches pré-remplies par catégorie
 */
export interface TaskTemplate {
    category: ServiceCategory;
    title: string;
    description: string;
    suggestedDuration: number; // minutes
    suggestedPrice: number; // euros
    tags: string[];
}

export const TASK_TEMPLATES: TaskTemplate[] = [
    // Aide à domicile
    {
        category: ServiceCategory.HOME_HELP,
        title: 'Ménage complet appartement',
        description: 'Nettoyage complet d\'un appartement : sols, surfaces, salle de bain, cuisine',
        suggestedDuration: 180,
        suggestedPrice: 60,
        tags: ['cleaning'],
    },
    {
        category: ServiceCategory.HOME_HELP,
        title: 'Rangement garage/cave',
        description: 'Organiser et ranger un espace de stockage (garage, cave, grenier)',
        suggestedDuration: 240,
        suggestedPrice: 80,
        tags: ['tidying'],
    },

    // Courses & Livraisons
    {
        category: ServiceCategory.DELIVERY,
        title: 'Courses hebdomadaires',
        description: 'Faire les courses au supermarché selon liste fournie',
        suggestedDuration: 90,
        suggestedPrice: 25,
        tags: ['groceries'],
    },
    {
        category: ServiceCategory.DELIVERY,
        title: 'Course urgente pharmacie',
        description: 'Récupérer des médicaments à la pharmacie',
        suggestedDuration: 30,
        suggestedPrice: 10,
        tags: ['pharmacy'],
    },

    // Aide Numérique
    {
        category: ServiceCategory.DIGITAL_HELP,
        title: 'Configuration smartphone senior',
        description: 'Paramétrer un smartphone pour une utilisation simplifiée',
        suggestedDuration: 120,
        suggestedPrice: 50,
        tags: ['smartphone_setup'],
    },
    {
        category: ServiceCategory.DIGITAL_HELP,
        title: 'Formation visioconférence',
        description: 'Apprendre à utiliser Zoom/Skype/WhatsApp Video',
        suggestedDuration: 90,
        suggestedPrice: 40,
        tags: ['app_training'],
    },

    // Déménagement
    {
        category: ServiceCategory.MOVING,
        title: 'Aide déménagement studio',
        description: 'Porter des cartons et meubles légers pendant un déménagement',
        suggestedDuration: 240,
        suggestedPrice: 80,
        tags: ['heavy_lifting'],
    },
    {
        category: ServiceCategory.MOVING,
        title: 'Montage meubles Ikea',
        description: 'Monter 2-3 meubles en kit',
        suggestedDuration: 180,
        suggestedPrice: 60,
        tags: ['furniture_assembly'],
    },

    // Accompagnement
    {
        category: ServiceCategory.ACCOMPANIMENT,
        title: 'Accompagnement rendez-vous médical',
        description: 'Accompagner à un rendez-vous chez le médecin/hôpital',
        suggestedDuration: 120,
        suggestedPrice: 35,
        tags: ['medical_appointment'],
    },
    {
        category: ServiceCategory.ACCOMPANIMENT,
        title: 'Compagnie après-midi',
        description: 'Passer du temps avec une personne (discussion, jeux, promenade)',
        suggestedDuration: 180,
        suggestedPrice: 50,
        tags: ['companionship'],
    },

    // Jardinage
    {
        category: ServiceCategory.GARDENING,
        title: 'Tonte pelouse',
        description: 'Tondre une pelouse de taille moyenne (100-200m²)',
        suggestedDuration: 90,
        suggestedPrice: 30,
        tags: ['lawn_mowing'],
    },
    {
        category: ServiceCategory.GARDENING,
        title: 'Nettoyage jardin automne',
        description: 'Ramasser feuilles mortes et désherbage basique',
        suggestedDuration: 180,
        suggestedPrice: 55,
        tags: ['garden_cleaning', 'leaf_removal'],
    },

    // Garde d'animaux
    {
        category: ServiceCategory.PET_CARE,
        title: 'Promenade chien quotidienne',
        description: 'Promener un chien pendant 30-45 minutes',
        suggestedDuration: 45,
        suggestedPrice: 15,
        tags: ['dog_walking'],
    },
    {
        category: ServiceCategory.PET_CARE,
        title: 'Garde chat weekend',
        description: 'Nourrir et s\'occuper d\'un chat pendant le weekend (2 visites/jour)',
        suggestedDuration: 30,
        suggestedPrice: 20,
        tags: ['pet_sitting', 'feeding'],
    },

    // Aide Événementielle
    {
        category: ServiceCategory.EVENT_HELP,
        title: 'Installation événement',
        description: 'Installer tables, chaises et décoration pour une fête',
        suggestedDuration: 180,
        suggestedPrice: 60,
        tags: ['setup'],
    },
    {
        category: ServiceCategory.EVENT_HELP,
        title: 'Service cocktail',
        description: 'Servir boissons et petits fours pendant une réception',
        suggestedDuration: 240,
        suggestedPrice: 80,
        tags: ['service'],
    },
];

/**
 * Badges provider par spécialisation
 */
export enum ProviderBadge {
    EXPERT_MAISON = 'expert_maison', // Spécialiste Aide à domicile
    SUPER_PORTEUR = 'super_porteur', // Expert Déménagement/Manutention
    TECH_HELPER = 'tech_helper', // Pro Aide Numérique
    ANIMAL_LOVER = 'animal_lover', // Expert Animalier
    MULTI_TALENTS = 'multi_talents', // Polyvalent (3+ catégories)
}

export interface BadgeMetadata {
    id: ProviderBadge;
    name: string;
    description: string;
    icon: string;
    color: string;
    requirements: string;
}

export const PROVIDER_BADGES: Record<ProviderBadge, BadgeMetadata> = {
    [ProviderBadge.EXPERT_MAISON]: {
        id: ProviderBadge.EXPERT_MAISON,
        name: 'Expert Maison',
        description: 'Spécialiste de l\'aide à domicile',
        icon: 'Home',
        color: 'blue',
        requirements: '10+ missions Aide à domicile avec 4.5+ étoiles',
    },
    [ProviderBadge.SUPER_PORTEUR]: {
        id: ProviderBadge.SUPER_PORTEUR,
        name: 'Super Porteur',
        description: 'Expert en déménagement et manutention',
        icon: 'Package',
        color: 'orange',
        requirements: '15+ missions Déménagement avec 4.5+ étoiles',
    },
    [ProviderBadge.TECH_HELPER]: {
        id: ProviderBadge.TECH_HELPER,
        name: 'Tech Helper',
        description: 'Pro de l\'aide numérique',
        icon: 'Smartphone',
        color: 'purple',
        requirements: '10+ missions Aide Numérique avec 4.7+ étoiles',
    },
    [ProviderBadge.ANIMAL_LOVER]: {
        id: ProviderBadge.ANIMAL_LOVER,
        name: 'Animal Lover',
        description: 'Expert animalier',
        icon: 'Dog',
        color: 'amber',
        requirements: '20+ missions Garde d\'animaux avec 4.5+ étoiles',
    },
    [ProviderBadge.MULTI_TALENTS]: {
        id: ProviderBadge.MULTI_TALENTS,
        name: 'Multi-Talents',
        description: 'Polyvalent sur plusieurs catégories',
        icon: 'Star',
        color: 'yellow',
        requirements: 'Missions dans 3+ catégories différentes avec 4.5+ étoiles',
    },
};
