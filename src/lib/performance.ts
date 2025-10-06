import { getPerformance, trace as createTrace } from 'firebase/performance';
import { getApps } from 'firebase/app';

let perf: ReturnType<typeof getPerformance> | null = null;

if (typeof window !== 'undefined' && getApps().length > 0) {
    perf = getPerformance(getApps()[0]);
}

export { perf };

export function measureNotificationLoad(userId: string) {
    if (!perf) return;

    const trace = createTrace(perf, 'notification_load');
    trace.putAttribute('user_id', userId);
    trace.start();

    return {
        stop: () => trace.stop(),
        incrementMetric: (name: string, value: number) => trace.incrementMetric(name, value),
    };
}

export function measureInfiniteScroll(page: number) {
    if (!perf) return;

    const trace = createTrace(perf, 'notification_infinite_scroll');
    trace.putAttribute('page', String(page));
    trace.start();

    return {
        stop: () => trace.stop(),
    };
}

export function measureCacheHit(hit: boolean) {
    if (!perf) return;

    const trace = createTrace(perf, hit ? 'notification_cache_hit' : 'notification_cache_miss');
    trace.start();
    trace.stop();
}
