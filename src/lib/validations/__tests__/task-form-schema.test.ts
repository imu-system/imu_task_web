import { createDynamicTaskSchema } from '../task-form-schema';

describe('createDynamicTaskSchema', () => {
    const validBaseData = {
        title: 'Test Task Title',
        description: 'This is a valid description with more than 20 characters.',
        categoryId: 'cat-123',
        addressId: 'addr-456',
        timeWindowStart: new Date('2025-11-10T10:00:00'),
        timeWindowEnd: new Date('2025-11-10T12:00:00'),
        priceOffered: 25,
        estimatedDurationMin: 120,
        numberOfProvidersRequired: 1,
    };

    test('base schema validates common fields without category-specific fields', () => {
        const schema = createDynamicTaskSchema(undefined);
        expect(() => schema.parse(validBaseData)).not.toThrow();
    });

    test('schema with organization fields validates areasToOrganize', () => {
        const schema = createDynamicTaskSchema('rangement');
        const dataWithOrgFields = {
            ...validBaseData,
            areasToOrganize: ['kitchen', 'closet'],
            goal: 'declutter',
            volumeEstimate: 'small',
        };
        expect(() => schema.parse(dataWithOrgFields)).not.toThrow();
    });

    test('schema with package fields requires serviceType', () => {
        const schema = createDynamicTaskSchema('colis-livraison');
        const dataWithoutServiceType = { ...validBaseData };

        // Should throw because serviceType is required for package schema
        expect(() => schema.parse(dataWithoutServiceType)).toThrow();

        const dataWithServiceType = {
            ...validBaseData,
            serviceType: 'pickup',
            locationName: 'Poste',
        };
        expect(() => schema.parse(dataWithServiceType)).not.toThrow();
    });

    test('schema with moving fields validates nested departure/arrival', () => {
        const schema = createDynamicTaskSchema('demenagement');
        const dataWithMovingFields = {
            ...validBaseData,
            peopleRequired: 2,
            departure: { floor: 3, hasElevator: false },
            arrival: { floor: 0, hasElevator: true },
            vehicleNeeded: 'provider_needed',
        };
        expect(() => schema.parse(dataWithMovingFields)).not.toThrow();
    });

    test('schema with petSitting fields parses date strings', () => {
        const schema = createDynamicTaskSchema('garde-animaux');
        const dataWithPetFields = {
            ...validBaseData,
            petType: 'Dog',
            petCount: 2,
            absenceStartDate: '2025-11-01',
            absenceEndDate: '2025-11-05',
            visitsPerDay: 2,
            tasks: ['feeding', 'play'],
        };
        const parsed = schema.parse(dataWithPetFields);
        expect(parsed.absenceStartDate).toBeInstanceOf(Date);
        expect(parsed.absenceEndDate).toBeInstanceOf(Date);
    });

    test('base schema rejects invalid timeWindowEnd before timeWindowStart', () => {
        const schema = createDynamicTaskSchema(undefined);
        const invalidData = {
            ...validBaseData,
            timeWindowStart: new Date('2025-11-10T14:00:00'),
            timeWindowEnd: new Date('2025-11-10T10:00:00'), // Before start
        };
        expect(() => schema.parse(invalidData)).toThrow();
    });

    test('base schema rejects title shorter than 5 characters', () => {
        const schema = createDynamicTaskSchema(undefined);
        const invalidData = {
            ...validBaseData,
            title: 'Test', // Only 4 characters
        };
        expect(() => schema.parse(invalidData)).toThrow();
    });

    test('category slug aliases work (FR and EN)', () => {
        const schemaFR = createDynamicTaskSchema('rangement');
        const schemaEN = createDynamicTaskSchema('organization');

        const testData = {
            ...validBaseData,
            areasToOrganize: ['office'],
            goal: 'optimize',
        };

        expect(() => schemaFR.parse(testData)).not.toThrow();
        expect(() => schemaEN.parse(testData)).not.toThrow();
    });
});
