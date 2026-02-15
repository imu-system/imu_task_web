import type { Timestamp } from 'firebase/firestore';

export type DateLike = Date | string | Timestamp | number | null | undefined;

export function toDate(value?: DateLike): Date | undefined {
    if (!value && value !== 0) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === 'number') return new Date(value);
    if (typeof value === 'string') {
        const d = new Date(value);
        return isNaN(d.getTime()) ? undefined : d;
    }
    // Firestore Timestamp
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as any).toDate === 'function') {
        try {
            return (value as any).toDate();
        } catch {
            return undefined;
        }
    }

    return undefined;
}

export function toMillis(value?: DateLike): number | undefined {
    const d = toDate(value);
    return d ? d.getTime() : undefined;
}

export function toISO(value?: DateLike): string | undefined {
    const d = toDate(value);
    return d ? d.toISOString() : undefined;
}

