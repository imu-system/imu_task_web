/**
 * Skill Mapping and Synonyms
 * Maps task categories to related skills for better provider matching
 */

/**
 * Skill synonyms and related categories
 * Used to find providers with similar skills when exact match is not found
 */
export const SKILL_SYNONYMS: Record<string, string[]> = {
    // Construction & Repair
    'Plumbing': ['Plumber', 'Pipe Repair', 'Water Systems', 'Plomberie'],
    'Electrical': ['Electrician', 'Wiring', 'Electrical Repair', 'Électricien'],
    'Carpentry': ['Carpenter', 'Woodwork', 'Furniture Repair', 'Menuiserie'],
    'Painting': ['Painter', 'House Painting', 'Interior Design', 'Peinture'],
    'Roofing': ['Roofer', 'Roof Repair', 'Toiture'],
    'Masonry': ['Mason', 'Bricklayer', 'Stone Work', 'Maçonnerie'],
    'HVAC': ['Heating', 'Ventilation', 'Air Conditioning', 'Climate Control'],
    'Landscaping': ['Gardener', 'Lawn Care', 'Garden Design', 'Jardinage'],

    // Home Services
    'Cleaning': ['House Cleaning', 'Deep Cleaning', 'Maid Service', 'Ménage'],
    'Moving': ['Mover', 'Relocation', 'Furniture Moving', 'Déménagement'],
    'Pest Control': ['Exterminator', 'Pest Management', 'Désinsectisation'],
    'Locksmith': ['Lock Repair', 'Key Cutting', 'Serrurier'],

    // Technology
    'Computer Repair': ['IT Support', 'Tech Support', 'PC Repair', 'Informatique'],
    'Phone Repair': ['Mobile Repair', 'Screen Replacement', 'Réparation Mobile'],
    'Network Setup': ['WiFi Setup', 'Router Configuration', 'Réseau'],
    'Smart Home': ['Home Automation', 'IoT Setup', 'Domotique'],

    // Automotive
    'Auto Repair': ['Car Mechanic', 'Vehicle Maintenance', 'Mécanicien'],
    'Auto Detailing': ['Car Wash', 'Car Cleaning', 'Lavage Auto'],
    'Tire Service': ['Tire Change', 'Wheel Alignment', 'Pneus'],

    // Personal Services
    'Tutoring': ['Teacher', 'Education', 'Academic Support', 'Professeur'],
    'Pet Care': ['Dog Walking', 'Pet Sitting', 'Veterinary', 'Garde Animaux'],
    'Babysitting': ['Childcare', 'Nanny', 'Garde Enfants'],
    'Fitness': ['Personal Trainer', 'Yoga', 'Fitness Coach', 'Coach Sportif'],

    // Creative Services
    'Photography': ['Photographer', 'Event Photography', 'Photographe'],
    'Videography': ['Video Editing', 'Filmmaker', 'Vidéaste'],
    'Graphic Design': ['Designer', 'Logo Design', 'Graphiste'],
    'Web Design': ['Web Developer', 'UI/UX', 'Développeur Web'],
    'Writing': ['Content Writer', 'Copywriter', 'Rédacteur'],

    // Event Services
    'Catering': ['Chef', 'Food Service', 'Traiteur'],
    'Event Planning': ['Party Planner', 'Wedding Planner', 'Organisateur'],
    'DJ Services': ['Music', 'Entertainment', 'DJ'],

    // Beauty & Wellness
    'Hairdressing': ['Hair Stylist', 'Barber', 'Coiffeur'],
    'Massage': ['Massage Therapy', 'Spa', 'Masseur'],
    'Makeup': ['Makeup Artist', 'Beauty', 'Maquilleur'],
};

/**
 * Get related skills for a given category
 * Returns the original skill plus any synonyms/related skills
 * 
 * @param category - The primary skill/category
 * @returns Array of skills including synonyms
 */
export function getRelatedSkills(category: string): string[] {
    const related = SKILL_SYNONYMS[category] || [];
    return [category, ...related];
}

/**
 * Normalize skill name for better matching
 * Converts to lowercase and trims whitespace
 * 
 * @param skill - The skill to normalize
 * @returns Normalized skill string
 */
export function normalizeSkill(skill: string): string {
    return skill.trim().toLowerCase();
}

/**
 * Find best matching skill from available skills
 * Checks for exact match, then partial match
 * 
 * @param targetSkill - The skill to find
 * @param availableSkills - Array of available skills
 * @returns Best matching skill or null
 */
export function findBestMatchingSkill(
    targetSkill: string,
    availableSkills: string[]
): string | null {
    const normalized = normalizeSkill(targetSkill);

    // Check exact match (case-insensitive)
    const exactMatch = availableSkills.find(
        skill => normalizeSkill(skill) === normalized
    );
    if (exactMatch) return exactMatch;

    // Check partial match
    const partialMatch = availableSkills.find(
        skill => normalizeSkill(skill).includes(normalized) ||
            normalized.includes(normalizeSkill(skill))
    );

    return partialMatch || null;
}

/**
 * Get skill category from a skill name
 * Useful for reverse lookup (skill -> category)
 * 
 * @param skillName - The skill to categorize
 * @returns Category name or the skill itself if no match
 */
export function getSkillCategory(skillName: string): string {
    const normalized = normalizeSkill(skillName);

    for (const [category, synonyms] of Object.entries(SKILL_SYNONYMS)) {
        if (normalizeSkill(category) === normalized) {
            return category;
        }

        const matchingSynonym = synonyms.find(
            syn => normalizeSkill(syn) === normalized
        );

        if (matchingSynonym) {
            return category;
        }
    }

    return skillName; // Return original if no category found
}

/**
 * Get all unique categories
 * Returns the main category names (keys)
 */
export function getAllCategories(): string[] {
    return Object.keys(SKILL_SYNONYMS);
}

/**
 * Get category with count of synonyms
 * Useful for analytics/admin UI
 */
export function getCategoryStats(): Array<{ category: string; synonymCount: number }> {
    return Object.entries(SKILL_SYNONYMS).map(([category, synonyms]) => ({
        category,
        synonymCount: synonyms.length
    }));
}
