class ErrorTracker {
    private errors: Array<{ error: Error; context: any; timestamp: Date }> = [];
    private maxErrors = 100;

    track(error: Error, context?: any) {
        console.error('🔴 Error tracked:', error, context);

        this.errors.push({
            error,
            context,
            timestamp: new Date(),
        });

        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Send to monitoring service (Sentry, etc.)
        if (typeof window !== 'undefined' && (window as any).Sentry) {
            (window as any).Sentry.captureException(error, { extra: context });
        }
    }

    getErrors() {
        return this.errors;
    }

    clear() {
        this.errors = [];
    }
}

export const errorTracker = new ErrorTracker();

// Notification-specific error tracking
export function trackNotificationError(
    operation: string,
    error: Error,
    notificationId?: string
) {
    errorTracker.track(error, {
        operation,
        notification_id: notificationId,
        timestamp: new Date().toISOString(),
    });
}

export function trackQueryError(queryKey: string, error: Error) {
    errorTracker.track(error, {
        type: 'react_query_error',
        query_key: queryKey,
        timestamp: new Date().toISOString(),
    });
}

export function trackMutationError(mutationKey: string, error: Error, variables?: any) {
    errorTracker.track(error, {
        type: 'react_query_mutation_error',
        mutation_key: mutationKey,
        variables,
        timestamp: new Date().toISOString(),
    });
}
