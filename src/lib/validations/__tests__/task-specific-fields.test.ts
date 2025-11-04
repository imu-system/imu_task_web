import {
    organizationFieldsSchema,
    packageFieldsSchema,
    techHelpFieldsSchema,
    movingFieldsSchema,
    petSittingFieldsSchema,
} from '../task-specific-fields';

describe('task-specific-fields schemas', () => {
    test('organizationFieldsSchema accepts valid payload', () => {
        const data = { areasToOrganize: ['kitchen', 'closet'], goal: 'declutter', volumeEstimate: 'small' };
        expect(() => organizationFieldsSchema.parse(data)).not.toThrow();
    });

    test('packageFieldsSchema requires serviceType', () => {
        const good = { serviceType: 'pickup', locationName: 'Poste' };
        expect(() => packageFieldsSchema.parse(good)).not.toThrow();

        const bad = { locationName: 'Poste' };
        expect(() => packageFieldsSchema.parse(bad)).toThrow();
    });

    test('techHelpFieldsSchema accepts remoteAccessPossible boolean', () => {
        const data = { deviceType: 'laptop', operatingSystem: 'windows', remoteAccessPossible: true };
        expect(() => techHelpFieldsSchema.parse(data)).not.toThrow();
    });

    test('movingFieldsSchema validates nested floors', () => {
        const data = { peopleRequired: 2, departure: { floor: 1, hasElevator: true }, arrival: { floor: 0, hasElevator: false } };
        expect(() => movingFieldsSchema.parse(data)).not.toThrow();
    });

    test('petSittingFieldsSchema parses ISO date strings', () => {
        const data = { petType: 'Cat', petCount: 1, absenceStartDate: '2025-11-01', absenceEndDate: '2025-11-05' };
        const parsed = petSittingFieldsSchema.parse(data);
        expect(parsed.absenceStartDate).toBeInstanceOf(Date);
        expect(parsed.absenceEndDate).toBeInstanceOf(Date);
    });
});
