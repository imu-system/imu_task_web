
export interface Course {
    id: string;
    title: string;
    description: string;
    category: 'provider' | 'client' | 'general';
    progress: number;
    badgeReward: string;
}

export const mockCourses: Course[] = [
    {
        id: 'basics-task-management',
        title: "Gestion des missions : Les bases",
        description: "Apprenez à créer, gérer et finaliser vos missions avec succès sur ImuTask.",
        category: 'client',
        progress: 60,
        badgeReward: "Gestionnaire Efficace",
    },
    {
        id: 'communication-with-clients',
        title: "Communiquer avec les clients",
        description: "Découvrez les meilleures pratiques pour une communication claire et professionnelle avec les clients.",
        category: 'provider',
        progress: 0,
        badgeReward: "Communicant Pro",
    },
    {
        id: 'profile-optimization',
        title: "Optimiser votre profil prestataire",
        description: "Mettez en valeur vos compétences pour attirer plus de missions.",
        category: 'provider',
        progress: 25,
        badgeReward: "Profil Parfait",
    },
    {
        id: 'security-best-practices',
        title: "Sécurité sur la plateforme",
        description: "Apprenez à reconnaître les arnaques et à sécuriser vos transactions et vos données.",
        category: 'general',
        progress: 0,
        badgeReward: "Gardien de la Sécurité",
    },
];
