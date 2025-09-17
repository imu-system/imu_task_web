
export interface CourseModule {
    id: string;
    title: string;
    status: 'completed' | 'in_progress' | 'locked';
    contentType: 'video' | 'text';
    content: string; // URL for video, markdown text for text
}

export interface Course {
    id: string;
    title: string;
    description: string;
    category: 'provider' | 'client' | 'general';
    progress: number;
    badgeReward: string;
    modules: CourseModule[];
}

export const mockCourses: Course[] = [
    {
        id: 'basics-task-management',
        title: "Gestion des missions : Les bases",
        description: "Apprenez à créer, gérer et finaliser vos missions avec succès sur ImuTask.",
        category: 'client',
        progress: 60,
        badgeReward: "Gestionnaire Efficace",
        modules: [
            { id: 'm1', title: 'Introduction', status: 'completed', contentType: 'text', content: 'Bienvenue dans ce cours !' },
            { id: 'm2', title: 'Module 1: Les bases', status: 'in_progress', contentType: 'video', content: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: 'm3', title: 'Module 2: Compétences avancées', status: 'locked', contentType: 'text', content: 'Contenu avancé...' },
            { id: 'm4', title: 'Quiz final', status: 'locked', contentType: 'text', content: 'Contenu du quiz...' },
        ]
    },
    {
        id: 'communication-with-clients',
        title: "Communiquer avec les clients",
        description: "Découvrez les meilleures pratiques pour une communication claire et professionnelle avec les clients.",
        category: 'provider',
        progress: 0,
        badgeReward: "Communicant Pro",
        modules: []
    },
    {
        id: 'profile-optimization',
        title: "Optimiser votre profil prestataire",
        description: "Mettez en valeur vos compétences pour attirer plus de missions.",
        category: 'provider',
        progress: 25,
        badgeReward: "Profil Parfait",
        modules: []
    },
    {
        id: 'security-best-practices',
        title: "Sécurité sur la plateforme",
        description: "Apprenez à reconnaître les arnaques et à sécuriser vos transactions et vos données.",
        category: 'general',
        progress: 0,
        badgeReward: "Gardien de la Sécurité",
        modules: []
    },
];

export const getCourseById = (id: string): Course | undefined => {
    return mockCourses.find(course => course.id === id);
}
